from rest_framework import serializers
from django.db import transaction
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from phonenumber_field.serializerfields import PhoneNumberField

from ..models import Usuario, Cliente
from ..serializers import UsuarioSerializer


class ClienteSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
    email = serializers.EmailField(
        source="usuario.email",
        required=False,
        validators=[],
        error_messages={
            "invalid": "Por favor, informe um endereço de e-mail válido.",
        },
    )

    class Meta:
        model = Cliente
        fields = [
            "usuario",
            "email",
            "nome",
            "cpf",
            "telefone",
            "pontos",
        ]
        read_only_fields = ["cpf", "pontos"]

    def update(self, instance, validated_data):
        usuario_data = validated_data.pop('usuario', None)
        with transaction.atomic():
            if usuario_data and 'email' in usuario_data:
                email = usuario_data['email']
                usuario = instance.usuario
                if Usuario.objects.exclude(pk=usuario.pk).filter(email=email).exists():
                    raise serializers.ValidationError({"email": ["Este e-mail já está em uso por outro usuário."]})
                usuario.email = email
                usuario.save()
            return super().update(instance, validated_data)


class ClienteRegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        label="Email",
        error_messages={
            "invalid": "Por favor, informe um endereço de e-mail válido.",
            "required": "O e-mail é um campo obrigatório.",
        },
    )
    password = serializers.CharField(
        write_only=True, required=True, label="Senha", style={"input_type": "password"}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        label="Confirme a senha",
        style={"input_type": "password"},
    )

    class Meta:
        model = Cliente
        fields = ["email", "password", "password2", "nome", "cpf", "telefone"]
        read_only_fields = ["is_staff"]

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})

        try:
            validate_password(attrs["password"])
        except ValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})

        return attrs

    def create(self, validated_data):
        email = validated_data.pop("email")
        password = validated_data.pop("password")
        validated_data.pop("password2")

        try:
            with transaction.atomic():
                usuario = Usuario.objects.create_user(
                    email=email,
                    password=password,
                    tipo_usuario=Usuario.TipoUsuario.CLIENTE,
                )
                cliente = Cliente.objects.create(usuario=usuario, **validated_data)
        except Exception as e:
            raise serializers.ValidationError(
                f"Ocorreu um erro durante o registro: {e}"
            )

        return cliente
