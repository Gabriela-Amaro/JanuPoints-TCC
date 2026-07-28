from django.test import TestCase, RequestFactory
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from usuarios.models import Cliente, Usuario
from estabelecimentos.models import Estabelecimento
from produtos.models import Produto
from tickets.models import TicketCredito, TicketDebito
from avaliacoes.models import AvaliacaoEstabelecimento
from avaliacoes.serializers import AvaliacaoEstabelecimentoSerializer


class AvaliacaoEstabelecimentoTest(TestCase):

    def setUp(self):
        self.factory = RequestFactory()

        # Criar usuários e clientes
        self.user1 = Usuario.objects.create_user(email="user1@example.com", password="password123")
        self.cliente1 = Cliente.objects.create(usuario=self.user1, nome="Cliente 1", cpf="111.111.111-11", telefone="+5511999999991")

        self.user2 = Usuario.objects.create_user(email="user2@example.com", password="password123")
        self.cliente2 = Cliente.objects.create(usuario=self.user2, nome="Cliente 2", cpf="222.222.222-22", telefone="+5511999999992")

        # Criar estabelecimentos
        self.est_ativo = Estabelecimento.objects.create(nome="Est Ativo", cnpj="11.111.111/0001-11", ativo=True)
        self.est_inativo = Estabelecimento.objects.create(nome="Est Inativo", cnpj="22.222.222/0002-22", ativo=False)

        # Criar produto
        self.produto = Produto.objects.create(estabelecimento=self.est_ativo, nome="Produto Teste", preco=10.00, pontos=100, ativo=True)

        # Criar tickets
        self.ticket_credito_concluido = TicketCredito.objects.create(
            cliente=self.cliente1, estabelecimento=self.est_ativo, preco=50.00, pontos=50,
            data_nota=timezone.now(), numero_nota="NF-001", status="CONCLUIDO"
        )
        self.ticket_credito_cancelado = TicketCredito.objects.create(
            cliente=self.cliente1, estabelecimento=self.est_ativo, preco=50.00, pontos=50,
            data_nota=timezone.now(), numero_nota="NF-002", status="CANCELADO"
        )
        self.ticket_credito_aberto = TicketCredito.objects.create(
            cliente=self.cliente1, estabelecimento=self.est_ativo, preco=50.00, pontos=50,
            data_nota=timezone.now(), numero_nota="NF-003", status="ABERTO"
        )
        self.ticket_credito_recusado = TicketCredito.objects.create(
            cliente=self.cliente1, estabelecimento=self.est_ativo, preco=50.00, pontos=50,
            data_nota=timezone.now(), numero_nota="NF-004", status="RECUSADO"
        )

        self.ticket_debito_concluido = TicketDebito.objects.create(
            cliente=self.cliente1, produto=self.produto, pontos=100, status="CONCLUIDO"
        )
        self.ticket_debito_cancelado = TicketDebito.objects.create(
            cliente=self.cliente1, produto=self.produto, pontos=100, status="CANCELADO"
        )

    def test_avaliacao_com_ticket_credito_concluido_sucesso(self):
        request = self.factory.post('/api/avaliacoes/')
        request.user = self.user1

        data = {
            "nota": 5,
            "comentario": "Excelente atendimento!",
            "ticket": {
                "id": self.ticket_credito_concluido.id,
                "type": "credito"
            }
        }

        serializer = AvaliacaoEstabelecimentoSerializer(data=data, context={"request": request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        avaliacao = serializer.save()

        self.assertEqual(avaliacao.estabelecimento, self.est_ativo)
        self.assertEqual(avaliacao.ticket, self.ticket_credito_concluido)
        self.assertEqual(self.ticket_credito_concluido.avaliacao, avaliacao)

    def test_avaliacao_com_ticket_debito_concluido_sucesso(self):
        request = self.factory.post('/api/avaliacoes/')
        request.user = self.user1

        data = {
            "nota": 4,
            "comentario": "Produto muito bom!",
            "ticket": {
                "id": self.ticket_debito_concluido.id,
                "type": "debito"
            }
        }

        serializer = AvaliacaoEstabelecimentoSerializer(data=data, context={"request": request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        avaliacao = serializer.save()

        self.assertEqual(avaliacao.estabelecimento, self.est_ativo)
        self.assertEqual(avaliacao.ticket, self.ticket_debito_concluido)
        self.assertEqual(self.ticket_debito_concluido.avaliacao, avaliacao)

    def test_avaliacao_com_ticket_cancelado_erro(self):
        request = self.factory.post('/api/avaliacoes/')
        request.user = self.user1

        for ticket_type, ticket in [("credito", self.ticket_credito_cancelado), ("debito", self.ticket_debito_cancelado)]:
            data = {
                "nota": 5,
                "comentario": "Não deveria funcionar.",
                "ticket": {
                    "id": ticket.id,
                    "type": ticket_type
                }
            }
            serializer = AvaliacaoEstabelecimentoSerializer(data=data, context={"request": request})
            self.assertFalse(serializer.is_valid())
            self.assertIn("ticket", serializer.errors)
            self.assertEqual(serializer.errors["ticket"][0], "Tickets cancelados não podem ser avaliados.")

    def test_avaliacao_com_ticket_nao_finalizado_erro(self):
        request = self.factory.post('/api/avaliacoes/')
        request.user = self.user1

        data = {
            "nota": 5,
            "comentario": "Ainda aberto.",
            "ticket": {
                "id": self.ticket_credito_aberto.id,
                "type": "credito"
            }
        }
        serializer = AvaliacaoEstabelecimentoSerializer(data=data, context={"request": request})
        self.assertFalse(serializer.is_valid())
        self.assertIn("ticket", serializer.errors)
        self.assertEqual(serializer.errors["ticket"][0], "Este ticket ainda não foi finalizado.")

    def test_avaliacao_com_ticket_outro_usuario_erro(self):
        request = self.factory.post('/api/avaliacoes/')
        # Entrar com o usuário 2 tentando avaliar ticket do usuário 1
        request.user = self.user2

        data = {
            "nota": 5,
            "comentario": "Invasão.",
            "ticket": {
                "id": self.ticket_credito_concluido.id,
                "type": "credito"
            }
        }
        serializer = AvaliacaoEstabelecimentoSerializer(data=data, context={"request": request})
        self.assertFalse(serializer.is_valid())
        self.assertIn("ticket", serializer.errors)
        self.assertEqual(serializer.errors["ticket"][0], "Este ticket de acúmulo não pertence ao usuário autenticado.")

    def test_dupla_avaliacao_mesmo_ticket_erro(self):
        request = self.factory.post('/api/avaliacoes/')
        request.user = self.user1

        data = {
            "nota": 5,
            "comentario": "Primeira avaliação.",
            "ticket": {
                "id": self.ticket_credito_concluido.id,
                "type": "credito"
            }
        }
        serializer1 = AvaliacaoEstabelecimentoSerializer(data=data, context={"request": request})
        self.assertTrue(serializer1.is_valid())
        serializer1.save()

        # Tentar avaliar novamente o mesmo ticket
        serializer2 = AvaliacaoEstabelecimentoSerializer(data=data, context={"request": request})
        self.assertFalse(serializer2.is_valid())
        self.assertIn("ticket", serializer2.errors)
        self.assertEqual(serializer2.errors["ticket"][0], "Este ticket de acúmulo já foi avaliado.")

    def test_avaliacao_ticket_recusado_permitido(self):
        request = self.factory.post('/api/avaliacoes/')
        request.user = self.user1

        data = {
            "nota": 2,
            "comentario": "Reclamação sobre recusa.",
            "ticket": {
                "id": self.ticket_credito_recusado.id,
                "type": "credito"
            }
        }
        serializer = AvaliacaoEstabelecimentoSerializer(data=data, context={"request": request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        avaliacao = serializer.save()
        self.assertEqual(avaliacao.ticket, self.ticket_credito_recusado)
