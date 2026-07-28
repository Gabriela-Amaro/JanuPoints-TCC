from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from .avaliacao_base_models import AvaliacaoBase


class AvaliacaoEstabelecimento(AvaliacaoBase):
    estabelecimento = models.ForeignKey(
        "estabelecimentos.Estabelecimento",
        on_delete=models.CASCADE,
        related_name="avaliacoes",
    )
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        limit_choices_to={"model__in": ("ticketcredito", "ticketdebito")},
        null=True,
        blank=True,
    )
    object_id = models.PositiveIntegerField(null=True, blank=True)
    ticket = GenericForeignKey("content_type", "object_id")

    class Meta(AvaliacaoBase.Meta):
        verbose_name = "Avaliação de Estabelecimento"
        verbose_name_plural = "Avaliações de Estabelecimentos"
        constraints = [
            models.UniqueConstraint(
                fields=["content_type", "object_id"],
                name="unique_ticket_evaluation",
                condition=models.Q(content_type__isnull=False, object_id__isnull=False)
            )
        ]

    def __str__(self):
        return f"{self.estabelecimento.nome} - {self.nota} ({self.usuario})"