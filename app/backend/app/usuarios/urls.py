from django.urls import path
from .views import (
    ChangePasswordView,
    ClienteCadastroView,
    ClienteDetailView,
    MeView,
)

urlpatterns = [
    # Informações do usuário logado
    path("me/", MeView.as_view(), name="user-me"),
    # Clientes
    path("clientes/cadastro/", ClienteCadastroView.as_view(), name="cliente-cadastro"),
    path("clientes/<int:pk>/", ClienteDetailView.as_view(), name="cliente-detail"),
    # Usuario geral
    path(
        "usuarios/change-password/",
        ChangePasswordView.as_view(),
        name="change-password",
    ),
]
