from decimal import Decimal
from io import StringIO
from hashlib import sha256
from pathlib import Path
from tempfile import TemporaryDirectory

from constance.test import override_config
from django.core.management import call_command
from django.core.management.base import CommandError
from django.db.models import Sum
from django.test import TestCase, override_settings
from PIL import Image
from rest_framework.test import APIClient

from core.seed_data import DOMINIO, SENHA_PADRAO, contas_teste
from estabelecimentos.models import Estabelecimento
from produtos.models import Produto
from tickets.models import TicketCredito, TicketDebito
from usuarios.models import Administrador, Cliente, Usuario


@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class PopularBancoTests(TestCase):
    def setUp(self):
        self.temp = TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.override = override_settings(
            MEDIA_ROOT=Path(self.temp.name) / "media", ENV="development"
        )
        self.override.enable()
        self.addCleanup(self.override.disable)
        self.logins = Path(self.temp.name) / "acessos.md"

    def popular(self):
        call_command("popular_banco", arquivo_logins=self.logins, stdout=StringIO())

    def conferir_saldos(self):
        for cliente in Cliente.objects.all():
            credito = (
                cliente.tickets_credito.filter(status="CONCLUIDO").aggregate(
                    total=Sum("pontos")
                )["total"]
                or 0
            )
            debito = (
                cliente.tickets_debito.exclude(
                    status__in=["RECUSADO", "CANCELADO"]
                ).aggregate(total=Sum("pontos"))["total"]
                or 0
            )
            self.assertEqual(cliente.pontos, credito - debito)
            self.assertGreaterEqual(cliente.pontos, 0)

    def test_carga_completa_com_imagens_validas_saldos_e_logins(self):
        self.popular()
        for modelo, total in (
            (Estabelecimento, 6),
            (Produto, 24),
            (Usuario, 21),
            (Cliente, 8),
            (TicketCredito, 73),
            (TicketDebito, 30),
        ):
            self.assertEqual(modelo.objects.count(), total)
        self.assertEqual(Administrador.objects.filter(super_user=False).count(), 6)
        self.assertSetEqual(
            set(TicketCredito.objects.values_list("status", flat=True)),
            {"ABERTO", "CONCLUIDO", "RECUSADO", "CANCELADO"},
        )
        self.assertSetEqual(
            set(TicketDebito.objects.values_list("status", flat=True)),
            {"ABERTO", "APROVADO", "CONCLUIDO", "RECUSADO", "CANCELADO"},
        )
        self.assertFalse(TicketDebito.objects.filter(produto__ativo=False).exists())
        self.assertFalse(
            TicketDebito.objects.filter(produto__estabelecimento__ativo=False).exists()
        )
        self.conferir_saldos()
        arquivos = []
        for estabelecimento in Estabelecimento.objects.all():
            estabelecimento.full_clean()
            arquivos.append(estabelecimento.logotipo.path)
        imagens_produtos = [Path(p.imagem.path) for p in Produto.objects.all()]
        self.assertEqual(len(set(imagens_produtos)), 24)
        # Arquivos com nomes diferentes também precisam conter fotografias diferentes.
        self.assertEqual(
            len(
                {sha256(imagem.read_bytes()).hexdigest() for imagem in imagens_produtos}
            ),
            24,
        )
        arquivos.extend(imagens_produtos)
        for ticket in TicketCredito.objects.all():
            arquivos.append(ticket.imagem.path)
            self.assertLessEqual(ticket.data_nota, ticket.created_at)
            self.assertLessEqual(ticket.created_at, ticket.updated_at)
        for arquivo in arquivos:
            with Image.open(arquivo) as imagem:
                imagem.verify()
        for perfil in list(Cliente.objects.all()) + list(Administrador.objects.all()):
            perfil.full_clean()
        relatorio = self.logins.read_text()
        for email, *_ in contas_teste():
            self.assertIn(email, relatorio)
            self.assertTrue(
                Usuario.objects.get(email=email).check_password(SENHA_PADRAO)
            )
        self.assertEqual(
            Cliente.objects.get(usuario__email=f"novo@{DOMINIO}").pontos, 0
        )

    def test_repeticao_preserva_movimentos_senha_e_status(self):
        self.popular()
        usuario = Usuario.objects.get(email=f"maria@{DOMINIO}")
        usuario.set_password("OutraSenha@2026")
        usuario.save()
        ticket = TicketCredito.objects.get(codigo="JPC00008")
        ticket.status = "CONCLUIDO"
        ticket.save()
        cliente = ticket.cliente
        cliente.pontos += ticket.pontos
        cliente.save()
        saldos = dict(Cliente.objects.values_list("pk", "pontos"))
        datas = list(
            TicketCredito.objects.values_list("pk", "created_at", "updated_at")
        )
        self.popular()
        self.assertEqual(TicketCredito.objects.count(), 73)
        self.assertEqual(TicketDebito.objects.count(), 30)
        self.assertEqual(Usuario.objects.count(), 21)
        self.assertEqual(dict(Cliente.objects.values_list("pk", "pontos")), saldos)
        self.assertEqual(
            list(TicketCredito.objects.values_list("pk", "created_at", "updated_at")),
            datas,
        )
        usuario.refresh_from_db()
        self.assertTrue(usuario.check_password("OutraSenha@2026"))
        linha = next(
            l for l in self.logins.read_text().splitlines() if usuario.email in l
        )
        self.assertIn("Preexistente; não alterada", linha)
        self.conferir_saldos()

    def test_atualiza_legado_preservando_ids_e_vinculos(self):
        farmacia = Estabelecimento.objects.create(
            cnpj="77.888.999/0001-63", nome="Farmácia VidaSaúde"
        )
        produto = Produto.objects.create(
            estabelecimento=farmacia, nome="Kit Protetor Solar", preco="45.00"
        )
        usuario = Usuario.objects.create_user(
            email="admin.farmacia@janu.com",
            password="SenhaExistente",
            tipo_usuario="ADMINISTRADOR",
        )
        admin = Administrador.objects.create(
            usuario=usuario,
            estabelecimento=farmacia,
            nome="Roberto",
            cpf="347.066.120-40",
        )
        livraria = Estabelecimento.objects.create(
            cnpj="12.345.678/0001-95", nome="Livraria Cultura Viva"
        )
        self.popular()
        farmacia.refresh_from_db()
        produto.refresh_from_db()
        livraria.refresh_from_db()
        self.assertEqual(farmacia.nome, "Hamburgueria Brasa do Norte")
        self.assertEqual(produto.nome, "Cheeseburger Artesanal")
        self.assertEqual(admin.estabelecimento_id, farmacia.pk)
        self.assertEqual(livraria.nome, "Pizzaria Forno da Praça")
        self.assertTrue(
            Usuario.objects.get(pk=usuario.pk).check_password("SenhaExistente")
        )
        self.assertIn(usuario.email, self.logins.read_text())
        self.assertEqual(Estabelecimento.objects.count(), 6)
        self.assertEqual(Produto.objects.count(), 24)

    def test_reverte_banco_se_relatorio_nao_puder_ser_gravado(self):
        self.logins = Path(self.temp.name)
        with self.assertRaises(CommandError):
            self.popular()
        self.assertFalse(Usuario.objects.exists())
        self.assertFalse(TicketCredito.objects.exists())
        self.assertFalse(Estabelecimento.objects.exists())

    @override_settings(ENV="production")
    def test_impede_carga_em_producao(self):
        with self.assertRaisesMessage(CommandError, "DJANGO_ENV=development"):
            self.popular()
        self.assertFalse(Usuario.objects.exists())

    @override_config(PONTOS_POR_REAL_GASTO=0.0)
    def test_impede_taxa_invalida(self):
        with self.assertRaisesMessage(CommandError, "devem ser positivos"):
            self.popular()
        self.assertFalse(Usuario.objects.exists())

    @override_config(PONTOS_POR_REAL_GASTO=2.5, PORCENTAGEM_CASHBACK=10.0)
    def test_respeita_taxas_configuradas(self):
        self.popular()
        self.conferir_saldos()
        ticket = TicketCredito.objects.get(codigo="JPC00000")
        self.assertEqual(ticket.pontos, int(ticket.preco * Decimal("2.5")))
        produto = Produto.objects.get(nome="Cappuccino da Casa")
        self.assertEqual(produto.pontos, 120)

    def test_usuarios_podem_autenticar_na_api(self):
        self.popular()
        api = APIClient()
        for email in (
            f"plataforma@{DOMINIO}",
            f"gerente.padaria@{DOMINIO}",
            f"atendente.padaria@{DOMINIO}",
            f"maria@{DOMINIO}",
        ):
            resposta = api.post(
                "/api/auth/token/",
                {"email": email, "password": SENHA_PADRAO},
                format="json",
            )
            self.assertEqual(resposta.status_code, 200, resposta.data)
            self.assertIn("access", resposta.data)
