from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)
from rest_framework.routers import DefaultRouter
from estabelecimentos.views import EstabelecimentoViewSet
from produtos.views import ProdutoViewSet

from tickets.views.debito_view import TicketDebitoViewSet
from tickets.views.credito_view import TicketCreditoViewSet
from tickets.views.sse_view import ticket_stream_view
from core.health import health



router = DefaultRouter()

router.register(r"estabelecimentos", EstabelecimentoViewSet, basename="estabelecimento")
router.register(r"produtos", ProdutoViewSet, basename="produto")

router.register(r'tickets/debito', TicketDebitoViewSet, basename='ticket_debito')
router.register(r'tickets/credito', TicketCreditoViewSet, basename='ticket_credito')

urlpatterns = [
    path("healthz/", health, name="health"),
    path("admin/", admin.site.urls),
    # Endpoints para Autenticação JWT
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/logout/", TokenBlacklistView.as_view(), name="token_blacklist"),
    path("api/", include("usuarios.urls")),
    path("api/", include(router.urls)),
    path("api/tickets/stream/", ticket_stream_view, name="ticket_stream"),


]

# Servir arquivos de mídia em desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

