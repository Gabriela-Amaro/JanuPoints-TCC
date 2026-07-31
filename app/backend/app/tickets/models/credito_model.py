from django.db import models
import uuid
from usuarios.models import Cliente
from estabelecimentos.models import Estabelecimento

class TicketCredito(models.Model):
    STATUS_CHOICES = [
        ('ABERTO', 'Aberto'),
        ('CONCLUIDO', 'Concluído'),
        ('CANCELADO', 'Cancelado'),
        ('RECUSADO', 'Recusado'),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='tickets_credito')
    estabelecimento = models.ForeignKey(Estabelecimento, on_delete=models.SET_NULL, null=True)
    imagem = models.ImageField(upload_to='notas_fiscais/', blank=True)  # mudar para false em produção
    codigo = models.CharField(max_length=10, unique=True, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ABERTO')
    preco = models.DecimalField(max_digits=10, decimal_places=2) 
    pontos = models.PositiveIntegerField(null=True, blank=True) 
    data_nota = models.DateTimeField()
    numero_nota = models.CharField(max_length=50)
    observacao = models.TextField(blank=True, null=True) 

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.codigo:
            self.codigo = str(uuid.uuid4())[:8].upper()
        super().save(*args, **kwargs)
