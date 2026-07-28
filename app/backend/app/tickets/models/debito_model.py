from django.db import models
import uuid
from usuarios.models import Cliente
from produtos.models import Produto

class TicketDebito(models.Model):
    STATUS_CHOICES = [
        ('ABERTO', 'Aberto'),
        ('APROVADO', 'Aprovado'),
        ('CONCLUIDO', 'Concluído'),
        ('CANCELADO', 'Cancelado'),
        ('RECUSADO', 'Recusado'),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='tickets_debito')
    produto = models.ForeignKey(Produto, on_delete=models.SET_NULL, null=True)
    codigo = models.CharField(max_length=10, unique=True, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ABERTO')
    pontos = models.PositiveIntegerField() # Pontos que o produto custava NA HORA da compra
    observacao = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.codigo:
            self.codigo = str(uuid.uuid4())[:8].upper()
        super().save(*args, **kwargs)

    @property
    def avaliacao(self):
        from avaliacoes.models import AvaliacaoEstabelecimento
        from django.contrib.contenttypes.models import ContentType
        ct = ContentType.objects.get_for_model(self.__class__)
        return AvaliacaoEstabelecimento.objects.filter(content_type=ct, object_id=self.id).first()
