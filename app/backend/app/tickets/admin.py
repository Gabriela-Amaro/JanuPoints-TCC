from django.contrib import admin
from django.utils.html import format_html
from .models import TicketDebito, TicketCredito

@admin.register(TicketDebito)
class TicketDebitoAdmin(admin.ModelAdmin):
    list_display = (
        'codigo', 
        'get_cliente_nome', 
        'produto', 
        'produto__estabelecimento__nome',
        'pontos', 
        'get_status_badge', 
        'created_at',
        'updated_at'
    )
    list_filter = ('status', 'created_at', 'produto__estabelecimento')
    search_fields = ('codigo', 'cliente__nome', 'cliente__cpf', 'produto__nome')
    readonly_fields = ('codigo', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Identificação', {
            'fields': ('codigo', 'status', 'created_at')
        }),
        ('Detalhes da Troca', {
            'fields': ('cliente', 'produto', 'pontos', 'observacao')
        }),
    )

    # Otimiza consultas ao banco (evita lentidão no admin)
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('cliente', 'produto')

    def get_cliente_nome(self, obj):
        return obj.cliente.nome
    get_cliente_nome.short_description = 'Cliente'

    def get_status_badge(self, obj):
        colors = {
            'ABERTO': 'blue',
            'APROVADO': 'orange',
            'CONCLUIDO': 'green',
            'CANCELADO': 'red',
            'RECUSADO': 'red',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 10px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    get_status_badge.short_description = 'Status'


@admin.register(TicketCredito)
class TicketCreditoAdmin(admin.ModelAdmin):
    list_display = (
        'codigo', 
        'get_cliente_nome', 
        'estabelecimento', 
        'preco', 
        'pontos', 
        'get_status_badge', 
        'get_imagem_preview',
        'created_at',
        'updated_at'
    )
    list_filter = ('status', 'estabelecimento', 'data_nota', 'created_at')
    search_fields = ('codigo', 'cliente__nome', 'numero_nota', 'estabelecimento__nome')
    readonly_fields = ('codigo', 'created_at', 'updated_at', 'get_imagem_preview_large')

    fieldsets = (
        ('Dados do Ticket', {
            'fields': ('codigo', 'status', 'created_at')
        }),
        ('Informações da Nota', {
            'fields': ('cliente', 'estabelecimento', 'imagem', 'get_imagem_preview_large')
        }),
        ('Valores', {
            'fields': ('preco', 'pontos', 'numero_nota', 'data_nota')
        }),
        ('Auditoria', {
            'fields': ('observacao', 'updated_at')
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('cliente', 'estabelecimento')

    def get_cliente_nome(self, obj):
        return obj.cliente.nome
    get_cliente_nome.short_description = 'Cliente'

    def get_status_badge(self, obj):
        colors = {
            'ABERTO': 'blue',
            'CONCLUIDO': 'green',
            'CANCELADO': 'gray',
            'RECUSADO': 'red',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 10px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    get_status_badge.short_description = 'Status'

    # Miniatura na lista
    def get_imagem_preview(self, obj):
        if obj.imagem:
            return format_html('<a href="{}" target="_blank"><img src="{}" style="width: 50px; height: auto; border-radius: 4px;" /></a>', obj.imagem.url, obj.imagem.url)
        return "-"
    get_imagem_preview.short_description = 'Nota Fiscal'

    # Preview grande dentro do detalhe
    def get_imagem_preview_large(self, obj):
        if obj.imagem:
            return format_html('<a href="{}" target="_blank"><img src="{}" style="max-width: 300px; height: auto;" /></a>', obj.imagem.url, obj.imagem.url)
        return "Sem imagem"
    get_imagem_preview_large.short_description = 'Visualização da Nota'