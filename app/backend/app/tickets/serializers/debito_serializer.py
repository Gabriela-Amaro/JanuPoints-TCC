from rest_framework import serializers
from django.db import transaction
from ..models import TicketDebito

class TicketDebitoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketDebito
        fields = ['id', 'produto']
        read_only_fields = ["id", "cliente", "codigo", "status", "pontos", "observacao", "created_at", "updated_at"]

    def validate(self, data):
        user = self.context['request'].user
        cliente = user.cliente
        produto = data['produto']

        if not produto.ativo or not produto.estabelecimento.ativo:
            raise serializers.ValidationError("Produto indisponível.")

        if cliente.pontos < produto.pontos:
            raise serializers.ValidationError(f"Saldo insuficiente: ({cliente.pontos}). Necessário: {produto.pontos}.")

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        cliente = user.cliente
        produto = validated_data['produto']
        
        with transaction.atomic():
            cliente.pontos -= produto.pontos
            cliente.save()

            ticket = TicketDebito.objects.create(
                cliente=cliente,
                produto=produto,
                pontos=produto.pontos
            )
        return ticket

class TicketAvaliacaoSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    nota = serializers.IntegerField(read_only=True)
    comentario = serializers.CharField(read_only=True)

class TicketDebitoReadSerializer(serializers.ModelSerializer):
    nome_produto = serializers.CharField(source='produto.nome', read_only=True)
    descricao_produto = serializers.CharField(source='produto.descricao', read_only=True, default='')
    nome_cliente = serializers.CharField(source='cliente.nome', read_only=True)
    imagem_produto = serializers.ImageField(source='produto.imagem', read_only=True)
    nome_estabelecimento = serializers.CharField(source='produto.estabelecimento.nome', read_only=True, default=None)
    logo_estabelecimento = serializers.ImageField(source='produto.estabelecimento.logotipo', read_only=True, default=None)
    estabelecimento = serializers.IntegerField(source='produto.estabelecimento.id', read_only=True)
    media_avaliacoes = serializers.FloatField(read_only=True)
    total_avaliacoes = serializers.IntegerField(read_only=True)
    avaliacao = TicketAvaliacaoSerializer(read_only=True)

    class Meta:
        model = TicketDebito
        fields = '__all__'