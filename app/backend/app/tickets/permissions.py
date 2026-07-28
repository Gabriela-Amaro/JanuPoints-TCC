from rest_framework import permissions

class IsTicketOwnerOrEstablishmentAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True

        if view.action == 'create':
            return hasattr(request.user, 'cliente')

        return True

    def has_object_permission(self, request, view, obj):
        user = request.user
        
        if user.is_superuser:
            return True

        if hasattr(user, 'cliente') and obj.cliente.usuario == user:
            return True

        estabelecimento = None
        if hasattr(obj, 'estabelecimento'):
             estabelecimento = obj.estabelecimento
        elif hasattr(obj, 'produto') and obj.produto:
             estabelecimento = obj.produto.estabelecimento

        if hasattr(user, 'administrador') and estabelecimento:
             return user.administrador.estabelecimento == estabelecimento

        return False
