import json
import time

from django.http import StreamingHttpResponse
from django.db.models import Q
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

from ..models import TicketDebito, TicketCredito
from ..serializers.debito_serializer import TicketDebitoReadSerializer
from ..serializers.credito_serializer import TicketCreditoReadSerializer


POLL_INTERVAL = 3  # seconds between each database check


def _authenticate(token_str):
    """Validate JWT token and return the user, or None."""
    try:
        access_token = AccessToken(token_str)
        from django.contrib.auth import get_user_model
        User = get_user_model()
        return User.objects.get(id=access_token["user_id"])
    except (TokenError, Exception):
        return None


def _get_estabelecimento(user):
    """Return the establishment associated with the user, or None."""
    if hasattr(user, "administrador"):
        return user.administrador.estabelecimento
    return None


def _build_ticket_list(estabelecimento):
    """
    Query open tickets for the given establishment.
    Returns a list of dicts with id, tipo, and codigo.
    """
    debitos = TicketDebito.objects.filter(
        produto__estabelecimento=estabelecimento,
        status="ABERTO",
    ).order_by("-created_at")

    creditos = TicketCredito.objects.filter(
        estabelecimento=estabelecimento,
        status="ABERTO",
    ).order_by("-created_at")

    ids = []
    for t in debitos:
        ids.append({"id": t.id, "tipo": "debito", "codigo": t.codigo})
    for t in creditos:
        ids.append({"id": t.id, "tipo": "credito", "codigo": t.codigo})
    return ids


def _serialize_tickets(debito_ids, credito_ids, estabelecimento):
    """Serialize full ticket data for the given IDs."""
    data = []

    if debito_ids:
        debitos = TicketDebito.objects.filter(
            id__in=debito_ids,
            produto__estabelecimento=estabelecimento,
        ).select_related("cliente__usuario", "produto__estabelecimento")
        for t in TicketDebitoReadSerializer(debitos, many=True).data:
            t["tipo"] = "debito"
            data.append(t)

    if credito_ids:
        creditos = TicketCredito.objects.filter(
            id__in=credito_ids,
            estabelecimento=estabelecimento,
        ).select_related("cliente__usuario", "estabelecimento")
        for t in TicketCreditoReadSerializer(creditos, many=True).data:
            t["tipo"] = "credito"
            data.append(t)

    return data


def _event_stream(user):
    """
    Generator that yields SSE events.
    Sends full ticket data only when new tickets are detected.
    """
    estabelecimento = _get_estabelecimento(user)
    if not estabelecimento:
        yield "event: error\ndata: {\"message\": \"Estabelecimento não encontrado\"}\n\n"
        return

    known_ids = set()

    # Initialize with current open tickets
    current = _build_ticket_list(estabelecimento)
    for t in current:
        known_ids.add((t["tipo"], t["id"]))

    # Send initial snapshot so frontend can sync
    initial_debito_ids = [t["id"] for t in current if t["tipo"] == "debito"]
    initial_credito_ids = [t["id"] for t in current if t["tipo"] == "credito"]
    initial_data = _serialize_tickets(initial_debito_ids, initial_credito_ids, estabelecimento)

    yield f"event: init\ndata: {json.dumps(initial_data, default=str)}\n\n"

    while True:
        time.sleep(POLL_INTERVAL)

        try:
            current = _build_ticket_list(estabelecimento)
            current_ids = set((t["tipo"], t["id"]) for t in current)

            new_ids = current_ids - known_ids
            if new_ids:
                new_debito = [tid for tipo, tid in new_ids if tipo == "debito"]
                new_credito = [tid for tipo, tid in new_ids if tipo == "credito"]

                new_tickets = _serialize_tickets(new_debito, new_credito, estabelecimento)
                yield f"event: new_tickets\ndata: {json.dumps(new_tickets, default=str)}\n\n"

                known_ids = current_ids
            else:
                # Heartbeat to keep connection alive
                yield ": heartbeat\n\n"

            # Also detect removed tickets (approved/cancelled)
            removed_ids = known_ids - current_ids
            if removed_ids:
                known_ids = current_ids

        except Exception:
            yield ": heartbeat\n\n"


def ticket_stream_view(request):
    """
    SSE endpoint for real-time ticket updates.
    Authenticates via JWT token passed as query parameter.
    """
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
    response["X-Accel-Buffering"] = "no"  # Disable nginx buffering
    return response
