from rest_framework import serializers
from ..models import TicketCredito
from constance import config
from django.utils import timezone

class TicketCreditoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketCredito
        fields = [
            "id",
            "cliente",
            "codigo",
            "status",
            'estabelecimento', 
            'imagem', 
            'preco', 
            'data_nota', 
            'numero_nota'
        ]
        read_only_fields = ["id", "cliente", "codigo", "status", "pontos", "observacao", "created_at", "updated_at"]

    def validate(self, data):
        if data['preco'] <= 0:
            raise serializers.ValidationError("O valor da nota deve ser positivo.")

        if data["data_nota"].date() > timezone.now().date():
            raise serializers.ValidationError("A data da nota não pode ser no futuro.")
        
        if TicketCredito.objects.filter(
            estabelecimento=data['estabelecimento'],
            numero_nota=data['numero_nota']
        ).exists():
            raise serializers.ValidationError("Esta nota já foi submetida.")
        
        if data['estabelecimento'].ativo is False:
            raise serializers.ValidationError("Estabelecimento inválido.")
        
        return data
    
    def create(self, validated_data):
        cliente = self.context['request'].user.cliente

        ticket = TicketCredito.objects.create(
            cliente=cliente,
            estabelecimento=validated_data['estabelecimento'],
            imagem=validated_data['imagem'],
            preco=validated_data['preco'],
            data_nota=validated_data['data_nota'],
            numero_nota=validated_data['numero_nota'],
            pontos=int(float(validated_data['preco']) * config.PONTOS_POR_REAL_GASTO)
        )
        return ticket



class TicketCreditoReadSerializer(serializers.ModelSerializer):
    nome_estabelecimento = serializers.CharField(source='estabelecimento.nome', read_only=True)
    nome_cliente = serializers.CharField(source='cliente.nome', read_only=True)
    logo_estabelecimento = serializers.ImageField(source='estabelecimento.logotipo', read_only=True, default=None)


    class Meta:
        model = TicketCredito
        fields = '__all__'