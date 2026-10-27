from io import StringIO
from tempfile import TemporaryDirectory
from pathlib import Path
from unittest.mock import patch

from django.core.files.storage import default_storage
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase, override_settings

from usuarios.models import Usuario
from estabelecimentos.models import Estabelecimento
from tickets.models import TicketCredito


@override_settings(
    PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"],
    STORAGES={
        "default": {"BACKEND": "django.core.files.storage.InMemoryStorage"},
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"
        },
    },
)
class DemoDeployTests(TestCase):
    @override_settings(
        ENV="production", ALLOW_DEMO_DATA=True, DEMO_PASSWORD="DemoHospedada@2026"
    )
    def test_seed_hospedado_storage_sem_disco_e_admin(self):
        with TemporaryDirectory() as pasta:
            relatorio = Path(pasta) / "senhas.md"
            output = StringIO()
            call_command(
                "popular_banco",
                sem_relatorio=True,
                arquivo_logins=relatorio,
                stdout=output,
            )
            self.assertFalse(relatorio.exists())
            self.assertNotIn("DemoHospedada@2026", output.getvalue())
            admin = Usuario.objects.get(email="plataforma@demo.janupoints.test")
            self.assertTrue(admin.is_staff and admin.is_superuser and admin.is_active)
            self.assertTrue(
                self.client.login(email=admin.email, password="DemoHospedada@2026")
            )
            self.assertEqual(self.client.get("/admin/", secure=True).status_code, 200)
            foto = Estabelecimento.objects.first().logotipo.name
            nota = TicketCredito.objects.first().imagem.name
            self.assertTrue(default_storage.exists(foto))
            self.assertTrue(default_storage.exists(nota))
            quantidade = Usuario.objects.count()
            default_storage.delete(nota)
            call_command("popular_banco", sem_relatorio=True, stdout=StringIO())
            self.assertEqual(Usuario.objects.count(), quantidade)
            self.assertTrue(default_storage.exists(nota))

    @override_settings(ENV="production", ALLOW_DEMO_DATA=True, DEMO_PASSWORD="")
    def test_seed_hospedado_exige_senha_configurada(self):
        with self.assertRaisesMessage(CommandError, "DEMO_PASSWORD"):
            call_command("popular_banco", sem_relatorio=True)
        self.assertFalse(Usuario.objects.exists())

    def test_health_banco_disponivel(self):
        resposta = self.client.get("/healthz/", secure=True)
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(resposta.json(), {"status": "ok"})

    def test_health_banco_indisponivel(self):
        with patch(
            "core.health.connection.cursor", side_effect=RuntimeError("sem banco")
        ):
            resposta = self.client.get("/healthz/", secure=True)
        self.assertEqual(resposta.status_code, 503)
        self.assertNotIn("sem banco", resposta.content.decode())
