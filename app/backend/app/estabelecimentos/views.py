from rest_framework import viewsets, permissions, mixins, filters

from .models import Estabelecimento
from .serializers import EstabelecimentoSerializer
from .permissions import IsSuperUserOfSameEstablishmentOrPlatformAdmin


class EstabelecimentoViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):

    serializer_class = EstabelecimentoSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["nome"]

    def get_queryset(self):
        base = Estabelecimento.objects.all()

        if self.action in ["list", "retrieve"]:
            user = self.request.user

            if user.is_authenticated and user.is_superuser:
                return base

            if user.is_authenticated and hasattr(user, "administrador"):
                return base.filter(
                    id=user.administrador.estabelecimento.id
                )

            return base.filter(ativo=True)
        else:
            return base

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
