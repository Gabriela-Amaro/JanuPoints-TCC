from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

from ..models import Usuario, Administrador, Cliente


class MeView(APIView):
    """
    Endpoint genérico que retorna dados do usuário logado.
    Funciona para todos os tipos de usuário (Cliente, Administrador).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Dados base do usuário
        base_data = {
            "id": user.id,
            "email": user.email,
            "tipo_usuario": user.tipo_usuario,
            "is_active": user.is_active,
        }

        # Verificar tipo e buscar dados específicos
        if user.tipo_usuario == Usuario.TipoUsuario.ADMINISTRADOR:
            try:
                admin = user.administrador
                return Response({
                    **base_data,
                    "nome": admin.nome,
                    "cpf": admin.cpf,
                    "super_user": admin.super_user,
                    "estabelecimento": {
                        "id": admin.estabelecimento.id,
                        "nome": admin.estabelecimento.nome,
                    },
                })
            except Administrador.DoesNotExist:
                return Response({
                    **base_data,
                    "warning": "Perfil de administrador não encontrado",
                })

        elif user.tipo_usuario == Usuario.TipoUsuario.CLIENTE:
            try:
                cliente = user.cliente
                return Response({
                    **base_data,
                    "nome": cliente.nome,
                    "cpf": cliente.cpf,
                    "telefone": str(cliente.telefone) if cliente.telefone else None,
                    "pontos": cliente.pontos,
                })
            except Cliente.DoesNotExist:
                return Response({
                    **base_data,
                    "warning": "Perfil de cliente não encontrado",
                })

        # Tipo de usuário desconhecido
        return Response(base_data)

