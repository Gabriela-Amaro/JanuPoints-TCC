from rest_framework import viewsets, exceptions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction



from ..models import TicketCredito
from ..serializers.credito_serializer import TicketCreditoCreateSerializer, TicketCreditoReadSerializer
from ..permissions import IsTicketOwnerOrEstablishmentAdmin

class TicketCreditoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsTicketOwnerOrEstablishmentAdmin]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        base = TicketCredito.objects.select_related("estabelecimento")
        if user.is_superuser:
            return base.all()
        if hasattr(user, 'cliente'):
            return base.filter(cliente__usuario=user)
        if hasattr(user, 'administrador'):
            return base.filter(estabelecimento=user.administrador.estabelecimento)
        return base.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return TicketCreditoCreateSerializer
        return TicketCreditoReadSerializer

    def perform_create(self, serializer):
        serializer.save(cliente=self.request.user.cliente)

    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        ticket = self.get_object()
        if ticket.cliente.usuario != request.user:
            raise exceptions.PermissionDenied("Apenas o dono pode cancelar.")
            
        if ticket.status != 'ABERTO':
            return Response({'error': 'Este ticket já foi processado.'}, status=400)

        ticket.status = 'CANCELADO'
        ticket.save()
        return Response({'status': 'Ticket cancelado com sucesso.'})

    @action(detail=True, methods=['post'])
    def aprovar(self, request, pk=None):
        ticket = self.get_object()
        
        if hasattr(request.user, 'cliente'):
             raise exceptions.PermissionDenied("Clientes não podem aprovar tickets.")
        
        if ticket.status != 'ABERTO':
            return Response({'error': 'Este ticket já foi processado.'}, status=400)

        pontos_ganhos = ticket.pontos

        with transaction.atomic():
            ticket.status = 'CONCLUIDO'
            ticket.save()
            
            ticket.cliente.pontos += pontos_ganhos
            ticket.cliente.save()

        return Response({
            'status': 'Ticket aprovado.', 
            'pontos_creditados': pontos_ganhos
        })

    @action(detail=True, methods=['post'])
    def recusar(self, request, pk=None):
        ticket = self.get_object()
        motivo = request.data.get('motivo', 'Dados inconsistentes com a nota fiscal.')

        if hasattr(request.user, 'cliente'):
             raise exceptions.PermissionDenied("Clientes não podem recusar tickets.")
        
        if ticket.status != 'ABERTO':
             return Response({'error': 'Este ticket já foi processado.'}, status=400)

        ticket.status = 'RECUSADO'
        ticket.observacao = motivo
        ticket.save()

        return Response({'status': 'Ticket recusado.'})