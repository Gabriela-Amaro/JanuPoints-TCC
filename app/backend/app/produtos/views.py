from rest_framework import viewsets, permissions, filters
from django.db.models import Avg, Count
from django_filters.rest_framework import DjangoFilterBackend
from .models import Produto
from .serializers import ProdutoSerializer
from core.permissions import IsSuperUserOfSameEstablishmentOrPlatformAdmin


class ProdutoViewSet(viewsets.ModelViewSet):
    serializer_class = ProdutoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ["nome"]
    filterset_fields = ["estabelecimento"]

    def get_queryset(self):
        base = Produto.objects.select_related("estabelecimento").annotate(
            estabelecimento_media_avaliacoes=Avg("estabelecimento__avaliacoes__nota"),
            estabelecimento_total_avaliacoes=Count("estabelecimento__avaliacoes"),
        )

        if self.action in ["list", "retrieve"]:
            user = self.request.user

            if user.is_authenticated and user.is_superuser:
                return base.order_by("nome")

            if user.is_authenticated and hasattr(user, 'administrador'):
                return base.filter(
                    estabelecimento=user.administrador.estabelecimento
                ).order_by("nome")

            return base.filter(ativo=True, estabelecimento__ativo=True).order_by("nome")
        else:
            return base.all()

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [IsSuperUserOfSameEstablishmentOrPlatformAdmin]

        return [permission() for permission in permission_classes]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request, "view": self})
        return context
