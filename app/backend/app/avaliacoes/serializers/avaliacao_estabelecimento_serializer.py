from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers
from ..models import AvaliacaoEstabelecimento
from .avaliacao_base_serializer import AvaliacaoBaseSerializer
from tickets.models import TicketCredito, TicketDebito


class TicketGenericField(serializers.Field):
    def to_representation(self, value):
        if not value:
            return None
        ticket_type = "credito" if isinstance(value, TicketCredito) else "debito"
        return {
            "id": value.id,
            "type": ticket_type,
            "codigo": value.codigo,
        }

    def to_internal_value(self, data):
        if not isinstance(data, dict):
            raise serializers.ValidationError("O campo ticket deve ser um dicionário/objeto com 'id' e 'type'.")

        ticket_id = data.get("id")
        ticket_type = data.get("type")

        if not ticket_id:
            raise serializers.ValidationError("O campo 'id' do ticket é obrigatório.")
        if ticket_type not in ["credito", "debito"]:
            raise serializers.ValidationError("O campo 'type' do ticket deve ser 'credito' ou 'debito'.")

        if ticket_type == "credito":
            try:
                ticket_obj = TicketCredito.objects.get(id=ticket_id)
            except TicketCredito.DoesNotExist:
                raise serializers.ValidationError("Ticket de crédito não encontrado.")
        else:
            try:
                ticket_obj = TicketDebito.objects.get(id=ticket_id)
            except TicketDebito.DoesNotExist:
                raise serializers.ValidationError("Ticket de débito não encontrado.")

        return ticket_obj


class AvaliacaoEstabelecimentoSerializer(AvaliacaoBaseSerializer):
    ticket = TicketGenericField()

    class Meta(AvaliacaoBaseSerializer.Meta):
        model = AvaliacaoEstabelecimento
        fields = AvaliacaoBaseSerializer.Meta.fields + ["estabelecimento", "ticket"]
        read_only_fields = AvaliacaoBaseSerializer.Meta.read_only_fields

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if self.instance is not None:
            self.fields["estabelecimento"].read_only = True
            self.fields["ticket"].read_only = True
        else:
            self.fields["estabelecimento"].required = False # (modificar)Permitir que o estabelecimento seja definido com base no ticket fornecido ou o estabelecimento seja fornecido diretamente.

    def validate(self, data):
        if self.instance is None:
            ticket = data.get("ticket")
            user = self.context["request"].user

            if not ticket:
                raise serializers.ValidationError(
                    {"ticket": "Você deve fornecer um ticket para realizar a avaliação."}
                )

            # Tickets cancelados não poderão ser avaliados
            if ticket.status == "CANCELADO":
                raise serializers.ValidationError(
                    {"ticket": "Tickets cancelados não podem ser avaliados."}
                )

            is_credito = isinstance(ticket, TicketCredito)

            if is_credito:
                if ticket.cliente.usuario != user:
                    raise serializers.ValidationError(
                        {"ticket": "Este ticket de acúmulo não pertence ao usuário autenticado."}
                    )
                if ticket.status not in ["CONCLUIDO", "RECUSADO"]:
                    raise serializers.ValidationError(
                        {"ticket": "Este ticket ainda não foi finalizado."}
                    )
                if AvaliacaoEstabelecimento.objects.filter(
                    content_type=ContentType.objects.get_for_model(TicketCredito),
                    object_id=ticket.id
                ).exists():
                    raise serializers.ValidationError(
                        {"ticket": "Este ticket de acúmulo já foi avaliado."}
                    )
                data["estabelecimento"] = ticket.estabelecimento

            else:  # Debito
                if ticket.cliente.usuario != user:
                    raise serializers.ValidationError(
                        {"ticket": "Este ticket de resgate não pertence ao usuário autenticado."}
                    )
                if ticket.status not in ["CONCLUIDO", "RECUSADO"]:
                    raise serializers.ValidationError(
                        {"ticket": "Este ticket ainda não foi finalizado."}
                    )
                if AvaliacaoEstabelecimento.objects.filter(
                    content_type=ContentType.objects.get_for_model(TicketDebito),
                    object_id=ticket.id
                ).exists():
                    raise serializers.ValidationError(
                        {"ticket": "Este ticket de resgate já foi avaliado."}
                    )
                data["estabelecimento"] = ticket.produto.estabelecimento

            estabelecimento = data.get("estabelecimento")
            if estabelecimento and not estabelecimento.ativo:
                raise serializers.ValidationError(
                    {
                        "estabelecimento": "Este estabelecimento está inativo e não pode receber avaliações."
                    }
                )

        return data