from rest_framework import viewsets, exceptions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.db.models import Avg, Count

from ..models import TicketDebito
from ..serializers.debito_serializer import TicketDebitoCreateSerializer, TicketDebitoReadSerializer
from ..permissions import IsTicketOwnerOrEstablishmentAdmin

class TicketDebitoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsTicketOwnerOrEstablishmentAdmin]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        base = TicketDebito.objects.select_related("produto__estabelecimento").annotate(
            media_avaliacoes=Avg("produto__estabelecimento__avaliacoes__nota"),
            total_avaliacoes=Count("produto__estabelecimento__avaliacoes"),
        )
        if user.is_superuser:
            return base.all()
        if hasattr(user, 'cliente'):
            return base.filter(cliente__usuario=user)
        if hasattr(user, 'administrador'):
            return base.filter(produto__estabelecimento=user.administrador.estabelecimento)
        return base.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return TicketDebitoCreateSerializer
        return TicketDebitoReadSerializer

    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        ticket = self.get_object()
        
        if ticket.cliente.usuario != request.user:
            raise exceptions.PermissionDenied("Apenas o cliente pode cancelar o pedido.")

        if ticket.status != 'ABERTO':
            return Response({'error': 'Este ticket já foi processado.'}, status=400)

        with transaction.atomic():
            ticket.cliente.pontos += ticket.pontos
            ticket.cliente.save()
            
            ticket.status = 'CANCELADO'
            ticket.save()

        return Response({'status': 'Ticket cancelado e pontos estornados.'})

    @action(detail=True, methods=['post'])
    def recusar(self, request, pk=None):
        ticket = self.get_object()
        
        if hasattr(request.user, 'cliente'):
             raise exceptions.PermissionDenied("Clientes não podem recusar tickets.")

        if ticket.status != 'ABERTO':
            return Response({'error': 'Este ticket já foi processado.'}, status=400)

        with transaction.atomic():
            ticket.cliente.pontos += ticket.pontos
            ticket.cliente.save()
            
            ticket.status = 'RECUSADO'
            ticket.save()

        return Response({'status': 'Ticket recusado.'})

    @action(detail=True, methods=['post'])
    def aprovar(self, request, pk=None):
        ticket = self.get_object()
        
        if hasattr(request.user, 'cliente'):
             raise exceptions.PermissionDenied("Clientes não podem aprovar tickets.")

        if ticket.status != 'ABERTO':
            return Response({'error': 'Este ticket já foi processado.'}, status=400)

        ticket.status = 'APROVADO'
        ticket.save()
        return Response({'status': 'Pedido aprovado.'})

    @action(detail=True, methods=['post'])
    def concluir(self, request, pk=None):
        ticket = self.get_object()
        
        if ticket.cliente.usuario != request.user:
            raise exceptions.PermissionDenied("Apenas o cliente pode concluir o pedido.")

        if ticket.status != 'APROVADO':
            return Response({'error': 'Tickets não aprovados não podem ser concluídos.'}, status=400)

        ticket.status = 'CONCLUIDO'
        ticket.save()
        return Response({'status': 'Pedido entregue com sucesso.'})