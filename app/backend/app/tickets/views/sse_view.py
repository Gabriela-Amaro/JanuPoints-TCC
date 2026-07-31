import json
import time

from django.contrib.auth import get_user_model
from django.http import StreamingHttpResponse
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken

from ..models import TicketCredito, TicketDebito

POLL_INTERVAL = 2


def _authenticate(token_value):
    try:
        token = AccessToken(token_value)
        user_model = get_user_model()
        return user_model.objects.get(id=token["user_id"])
    except (TokenError, KeyError, ValueError, get_user_model().DoesNotExist):
        return None


def _get_estabelecimento(user):
    administrador = getattr(user, "administrador", None)
    return getattr(administrador, "estabelecimento", None)


def _get_open_ticket_ids(estabelecimento):
    creditos = TicketCredito.objects.filter(
        estabelecimento=estabelecimento,
        status="ABERTO",
    ).values_list("id", flat=True)
    debitos = TicketDebito.objects.filter(
        produto__estabelecimento=estabelecimento,
        status="ABERTO",
    ).values_list("id", flat=True)

    return {
        ("credito", ticket_id) for ticket_id in creditos
    } | {
        ("debito", ticket_id) for ticket_id in debitos
    }


def _event_stream(user):
    estabelecimento = _get_estabelecimento(user)
    if not estabelecimento:
        yield "event: error\ndata: {\"message\": \"Estabelecimento não encontrado\"}\n\n"
        return

    previous_ids = None

    while True:
        try:
            current_ids = _get_open_ticket_ids(estabelecimento)
            if current_ids != previous_ids:
                previous_ids = current_ids
                payload = {"total": len(current_ids)}
                yield f"event: tickets_changed\ndata: {json.dumps(payload)}\n\n"
            else:
                yield ": heartbeat\n\n"
            time.sleep(POLL_INTERVAL)
        except GeneratorExit:
            return
        except Exception:
            # Mantém a conexão viva; a próxima iteração tenta consultar novamente.
            yield ": heartbeat\n\n"
            time.sleep(POLL_INTERVAL)


def ticket_stream_view(request):
    token = request.GET.get("token")
    if not token:
        return StreamingHttpResponse(
            "event: error\ndata: {\"message\": \"Token não fornecido\"}\n\n",
            content_type="text/event-stream",
            status=401,
        )

    user = _authenticate(token)
    if not user:
        return StreamingHttpResponse(
            "event: error\ndata: {\"message\": \"Token inválido\"}\n\n",
            content_type="text/event-stream",
            status=401,
        )

    response = StreamingHttpResponse(
        _event_stream(user),
        content_type="text/event-stream",
    )
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response
