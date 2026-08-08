"""
Comando para popular o banco de dados com dados realistas de seed.
Respeita todas as regras de negócio do JanuPoints.
"""

import os
import shutil
import uuid
from datetime import timedelta
from decimal import Decimal
from pathlib import Path

from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from constance import config

from usuarios.models.usuario_models import Usuario
from usuarios.models.cliente_models import Cliente
from usuarios.models.administrador_models import Administrador
from estabelecimentos.models import Estabelecimento
from produtos.models import Produto
from tickets.models import TicketCredito, TicketDebito


# Diretório com as imagens de seed (dentro de media/)
SEED_DIR = Path(settings.MEDIA_ROOT) / "seed_images"


def _copiar_imagem(nome_arquivo, subpasta_destino):
    """
    Copia uma imagem de seed_images/ para a subpasta de upload (logotipos/, produtos/, etc.)
    e retorna o caminho relativo ao MEDIA_ROOT que será salvo no banco.
    """
    origem = SEED_DIR / nome_arquivo
    if not origem.exists():
        return ""

    destino_dir = Path(settings.MEDIA_ROOT) / subpasta_destino
    destino_dir.mkdir(parents=True, exist_ok=True)
    destino = destino_dir / nome_arquivo
    shutil.copy2(str(origem), str(destino))
    # Retorna o caminho relativo que o Django espera (ex: "logotipos/logo_padaria.jpg")
    return f"{subpasta_destino}/{nome_arquivo}"


class Command(BaseCommand):
    help = "Popula o banco de dados com dados realistas de seed (com imagens)."

    SENHA_PADRAO = "Janu@2026"

    def handle(self, *args, **options):
        self.stdout.write("Iniciando a população do banco de dados...\n")

        with transaction.atomic():
            estabelecimentos = self._criar_estabelecimentos()
            admins = self._criar_administradores(estabelecimentos)
            clientes = self._criar_clientes()
            produtos = self._criar_produtos(estabelecimentos)
            self._criar_tickets_credito(clientes, estabelecimentos)
            self._criar_tickets_debito(clientes, produtos)

        self.stdout.write(self.style.SUCCESS("\n✅ Banco de dados populado com sucesso!"))
        self._imprimir_resumo()

    # ------------------------------------------------------------------ #
    # Estabelecimentos
    # ------------------------------------------------------------------ #
    def _criar_estabelecimentos(self):
        dados = [
            {
                "nome": "Padaria Pão Dourado",
                "endereco": "Rua das Flores, 123 - Centro, São Paulo/SP",
                "telefone": "+5511999001001",
                "descricao": "Padaria artesanal com pães frescos todos os dias.",
                "cnpj": "11.222.333/0001-81",
                "horario_funcionamento": {
                    "segunda": "06:00-20:00",
                    "terca": "06:00-20:00",
                    "quarta": "06:00-20:00",
                    "quinta": "06:00-20:00",
                    "sexta": "06:00-20:00",
                    "sabado": "06:00-14:00",
                    "domingo": "Fechado",
                },
                "ativo": True,
                "logotipo_seed": "logo_padaria.jpg",
            },
            {
                "nome": "Restaurante Sabor da Terra",
                "endereco": "Av. Paulista, 1500 - Bela Vista, São Paulo/SP",
                "telefone": "+5511999002002",
                "descricao": "Comida caseira brasileira com ingredientes frescos da região.",
                "cnpj": "44.555.666/0001-72",
                "horario_funcionamento": {
                    "segunda": "11:00-15:00",
                    "terca": "11:00-15:00",
                    "quarta": "11:00-15:00",
                    "quinta": "11:00-15:00",
                    "sexta": "11:00-15:00 / 18:00-22:00",
                    "sabado": "11:00-16:00",
                    "domingo": "Fechado",
                },
                "ativo": True,
                "logotipo_seed": "logo_restaurante.jpg",
            },
            {
                "nome": "Farmácia VidaSaúde",
                "endereco": "Rua Augusta, 800 - Consolação, São Paulo/SP",
                "telefone": "+5511999003003",
                "descricao": "Medicamentos, cosméticos e produtos de bem-estar.",
                "cnpj": "77.888.999/0001-63",
                "horario_funcionamento": {
                    "segunda": "07:00-22:00",
                    "terca": "07:00-22:00",
                    "quarta": "07:00-22:00",
                    "quinta": "07:00-22:00",
                    "sexta": "07:00-22:00",
                    "sabado": "08:00-18:00",
                    "domingo": "08:00-14:00",
                },
                "ativo": True,
                "logotipo_seed": "logo_farmacia.jpg",
            },
            {
                "nome": "Livraria Cultura Viva",
                "endereco": "Rua Oscar Freire, 350 - Jardins, São Paulo/SP",
                "telefone": "+5511999004004",
                "descricao": "Livros, papelaria e espaço cultural.",
                "cnpj": "12.345.678/0001-95",
                "horario_funcionamento": {
                    "segunda": "09:00-21:00",
                    "terca": "09:00-21:00",
                    "quarta": "09:00-21:00",
                    "quinta": "09:00-21:00",
                    "sexta": "09:00-21:00",
                    "sabado": "10:00-18:00",
                    "domingo": "Fechado",
                },
                "ativo": False,  # Estabelecimento INATIVO para demonstrar a regra
                "logotipo_seed": "logo_livraria.png",
            },
        ]

        estabelecimentos = []
        for d in dados:
            logotipo_seed = d.pop("logotipo_seed")
            logotipo_path = _copiar_imagem(logotipo_seed, "logotipos")

            obj, created = Estabelecimento.objects.get_or_create(
                cnpj=d["cnpj"],
                defaults={**d, "logotipo": logotipo_path},
            )
            # Se já existia mas não tem logotipo, atualizar
            if not created and not obj.logotipo and logotipo_path:
                obj.logotipo = logotipo_path
                obj.save()

            estabelecimentos.append(obj)
            img_status = "✓ com logo" if obj.logotipo else "✗ sem logo"
            status = "criado" if created else "já existia"
            self.stdout.write(f"  Estabelecimento: {obj.nome} ({status}) [{img_status}]")

        return estabelecimentos

    # ------------------------------------------------------------------ #
    # Administradores
    # ------------------------------------------------------------------ #
    def _criar_administradores(self, estabelecimentos):
        dados = [
            # Padaria - admin + super_user do estabelecimento
            {
                "email": "admin.padaria@janu.com",
                "nome": "Carlos Mendes",
                "cpf": "529.982.247-25",
                "estabelecimento": estabelecimentos[0],
                "super_user": True,
            },
            # Restaurante - admin comum
            {
                "email": "admin.restaurante@janu.com",
                "nome": "Fernanda Oliveira",
                "cpf": "418.316.658-20",
                "estabelecimento": estabelecimentos[1],
                "super_user": False,
            },
            # Farmácia - admin comum
            {
                "email": "admin.farmacia@janu.com",
                "nome": "Roberto Silva",
                "cpf": "347.066.120-40",
                "estabelecimento": estabelecimentos[2],
                "super_user": False,
            },
            # Livraria (inativa) - admin
            {
                "email": "admin.livraria@janu.com",
                "nome": "Juliana Costa",
                "cpf": "821.547.890-10",
                "estabelecimento": estabelecimentos[3],
                "super_user": False,
            },
        ]

        admins = []
        for d in dados:
            usuario, u_created = Usuario.objects.get_or_create(
                email=d["email"],
                defaults={
                    "tipo_usuario": Usuario.TipoUsuario.ADMINISTRADOR,
                },
            )
            if u_created:
                usuario.set_password(self.SENHA_PADRAO)
                usuario.save()

            admin, a_created = Administrador.objects.get_or_create(
                usuario=usuario,
                defaults={
                    "nome": d["nome"],
                    "cpf": d["cpf"],
                    "estabelecimento": d["estabelecimento"],
                    "super_user": d["super_user"],
                },
            )
            admins.append(admin)
            status = "criado" if a_created else "já existia"
            self.stdout.write(
                f"  Administrador: {admin.nome} - {d['email']} ({status})"
            )

        return admins

    # ------------------------------------------------------------------ #
    # Clientes
    # ------------------------------------------------------------------ #
    def _criar_clientes(self):
        dados = [
            {
                "email": "maria@email.com",
                "nome": "Maria Santos",
                "cpf": "154.736.928-00",
                "telefone": "+5511988001001",
            },
            {
                "email": "joao@email.com",
                "nome": "João Pereira",
                "cpf": "787.613.824-04",
                "telefone": "+5511988002002",
            },
            {
                "email": "ana@email.com",
                "nome": "Ana Lima",
                "cpf": "327.178.560-48",
                "telefone": "+5511988003003",
            },
        ]

        clientes = []
        for d in dados:
            usuario, u_created = Usuario.objects.get_or_create(
                email=d["email"],
                defaults={
                    "tipo_usuario": Usuario.TipoUsuario.CLIENTE,
                },
            )
            if u_created:
                usuario.set_password(self.SENHA_PADRAO)
                usuario.save()

            cliente, c_created = Cliente.objects.get_or_create(
                usuario=usuario,
                defaults={
                    "nome": d["nome"],
                    "cpf": d["cpf"],
                    "telefone": d["telefone"],
                    "pontos": 0,
                },
            )
            clientes.append(cliente)
            status = "criado" if c_created else "já existia"
            self.stdout.write(
                f"  Cliente: {cliente.nome} - {d['email']} ({status})"
            )

        return clientes

    # ------------------------------------------------------------------ #
    # Produtos (pontos calculados automaticamente pelo model.save)
    # ------------------------------------------------------------------ #
    def _criar_produtos(self, estabelecimentos):
        padaria, restaurante, farmacia, livraria = estabelecimentos

        dados = [
            # Padaria Pão Dourado
            {"estabelecimento": padaria, "nome": "Café com Pão na Chapa", "descricao": "Combo café expresso + pão na chapa com manteiga.", "preco": Decimal("12.00"), "ativo": True, "imagem_seed": "produto_cafe_pao.jpg"},
            {"estabelecimento": padaria, "nome": "Bolo de Cenoura Fatia", "descricao": "Fatia generosa de bolo de cenoura com cobertura de chocolate.", "preco": Decimal("9.50"), "ativo": True, "imagem_seed": "produto_bolo_cenoura.png"},
            {"estabelecimento": padaria, "nome": "Kit Festa 50 Salgados", "descricao": "50 salgados variados para festas.", "preco": Decimal("75.00"), "ativo": True, "imagem_seed": "produto_kit_festa.jpg"},
            {"estabelecimento": padaria, "nome": "Pão de Queijo (pacote 10 un.)", "descricao": "Pacote com 10 pães de queijo artesanais.", "preco": Decimal("18.00"), "ativo": False, "imagem_seed": "produto_pao_queijo.png"},
            # Restaurante Sabor da Terra
            {"estabelecimento": restaurante, "nome": "Marmita Executiva", "descricao": "Arroz, feijão, salada, proteína do dia e acompanhamento.", "preco": Decimal("22.00"), "ativo": True, "imagem_seed": "produto_marmita.jpg"},
            {"estabelecimento": restaurante, "nome": "Sobremesa do Dia", "descricao": "Pudim, mousse ou fruta da estação.", "preco": Decimal("8.00"), "ativo": True, "imagem_seed": "produto_sobremesa.jpg"},
            {"estabelecimento": restaurante, "nome": "Combo Almoço Completo", "descricao": "Marmita executiva + suco natural + sobremesa.", "preco": Decimal("32.00"), "ativo": True, "imagem_seed": "produto_combo_almoco.png"},
            # Farmácia VidaSaúde
            {"estabelecimento": farmacia, "nome": "Kit Protetor Solar", "descricao": "Protetor solar FPS 50 + hidratante pós-sol.", "preco": Decimal("45.00"), "ativo": True, "imagem_seed": "produto_protetor_solar.png"},
            {"estabelecimento": farmacia, "nome": "Vitamina C 30 comprimidos", "descricao": "Vitamina C efervescente, 1g, caixa com 30.", "preco": Decimal("25.00"), "ativo": True, "imagem_seed": "produto_vitamina_c.jpg"},
            # Livraria (inativa)
            {"estabelecimento": livraria, "nome": "Vale-livro R$30", "descricao": "Vale para compra de livros no valor de R$ 30.", "preco": Decimal("30.00"), "ativo": True, "imagem_seed": "produto_vale_livro.jpg"},
        ]

        produtos = []
        for d in dados:
            imagem_seed = d.pop("imagem_seed")
            imagem_path = _copiar_imagem(imagem_seed, "produtos")

            obj, created = Produto.objects.get_or_create(
                estabelecimento=d["estabelecimento"],
                nome=d["nome"],
                defaults={
                    "descricao": d["descricao"],
                    "preco": d["preco"],
                    "ativo": d["ativo"],
                    "imagem": imagem_path,
                },
            )
            # Se já existia mas não tem imagem, atualizar
            if not created and not obj.imagem and imagem_path:
                obj.imagem = imagem_path
                obj.save()
            elif created:
                # Forçar save para calcular pontos
                obj.save()

            produtos.append(obj)
            img_status = "✓ com img" if obj.imagem else "✗ sem img"
            status = "criado" if created else "já existia"
            self.stdout.write(
                f"  Produto: {obj.nome} | {obj.estabelecimento.nome} | "
                f"R${obj.preco} → {obj.pontos}pts ({status}) [{img_status}]"
            )

        return produtos

    # ------------------------------------------------------------------ #
    # Tickets de Crédito
    # ------------------------------------------------------------------ #
    def _criar_tickets_credito(self, clientes, estabelecimentos):
        """
        Cria tickets de crédito em vários status.
        Ao aprovar, credita os pontos ao cliente (regra RF4.6).
        """
        padaria, restaurante, farmacia, _livraria = estabelecimentos
        maria, joao, ana = clientes
        agora = timezone.now()
        pontos_por_real = config.PONTOS_POR_REAL_GASTO

        # Imagem do cupom fiscal usada nos tickets
        cupom_path = _copiar_imagem("cupom_fiscal.jpg", "notas_fiscais")

        tickets_data = [
            # MARIA - 2 tickets aprovados (CONCLUIDO) → recebe pontos
            {
                "cliente": maria, "estabelecimento": padaria,
                "preco": Decimal("85.50"), "data_nota": agora - timedelta(days=10),
                "numero_nota": "NF-001", "status_final": "CONCLUIDO",
            },
            {
                "cliente": maria, "estabelecimento": restaurante,
                "preco": Decimal("120.00"), "data_nota": agora - timedelta(days=5),
                "numero_nota": "NF-002", "status_final": "CONCLUIDO",
            },
            # MARIA - 1 ticket aberto (pendente de análise)
            {
                "cliente": maria, "estabelecimento": farmacia,
                "preco": Decimal("200.00"), "data_nota": agora - timedelta(days=1),
                "numero_nota": "NF-003", "status_final": "ABERTO",
            },
            # JOAO - 1 ticket aprovado → recebe pontos
            {
                "cliente": joao, "estabelecimento": padaria,
                "preco": Decimal("50.00"), "data_nota": agora - timedelta(days=15),
                "numero_nota": "NF-004", "status_final": "CONCLUIDO",
            },
            # JOAO - 1 ticket recusado (sem pontos)
            {
                "cliente": joao, "estabelecimento": restaurante,
                "preco": Decimal("35.00"), "data_nota": agora - timedelta(days=8),
                "numero_nota": "NF-005", "status_final": "RECUSADO",
                "observacao": "Nota fiscal ilegível.",
            },
            # JOAO - 1 ticket aberto
            {
                "cliente": joao, "estabelecimento": farmacia,
                "preco": Decimal("90.00"), "data_nota": agora - timedelta(days=2),
                "numero_nota": "NF-006", "status_final": "ABERTO",
            },
            # ANA - 1 ticket aprovado → recebe pontos
            {
                "cliente": ana, "estabelecimento": restaurante,
                "preco": Decimal("300.00"), "data_nota": agora - timedelta(days=20),
                "numero_nota": "NF-007", "status_final": "CONCLUIDO",
            },
            # ANA - 1 ticket cancelado
            {
                "cliente": ana, "estabelecimento": padaria,
                "preco": Decimal("15.00"), "data_nota": agora - timedelta(days=3),
                "numero_nota": "NF-008", "status_final": "CANCELADO",
            },
        ]

        # Dicionário para acumular pontos que serão creditados
        pontos_a_creditar = {}

        for td in tickets_data:
            pontos = int(float(td["preco"]) * pontos_por_real)

            # Verificar se o ticket já existe (evitar duplicatas por numero_nota+estabelecimento)
            if TicketCredito.objects.filter(
                estabelecimento=td["estabelecimento"],
                numero_nota=td["numero_nota"],
            ).exists():
                self.stdout.write(
                    f"  Ticket crédito: {td['numero_nota']} já existe. Pulando."
                )
                continue

            ticket = TicketCredito.objects.create(
                cliente=td["cliente"],
                estabelecimento=td["estabelecimento"],
                imagem=cupom_path,
                preco=td["preco"],
                pontos=pontos,
                data_nota=td["data_nota"],
                numero_nota=td["numero_nota"],
                status=td["status_final"],
                observacao=td.get("observacao", ""),
            )

            # Se aprovado/concluído, creditar pontos ao cliente
            if td["status_final"] == "CONCLUIDO":
                cliente_pk = td["cliente"].pk
                pontos_a_creditar[cliente_pk] = (
                    pontos_a_creditar.get(cliente_pk, 0) + pontos
                )

            img_status = "✓ com img" if ticket.imagem else "✗ sem img"
            self.stdout.write(
                f"  Ticket crédito: {ticket.codigo} | {td['cliente'].nome} → "
                f"{td['estabelecimento'].nome} | R${td['preco']} = {pontos}pts | "
                f"Status: {td['status_final']} [{img_status}]"
            )

        # Creditar pontos acumulados
        for cliente in clientes:
            creditos = pontos_a_creditar.get(cliente.pk, 0)
            if creditos > 0:
                cliente.pontos += creditos
                cliente.save()
                self.stdout.write(
                    f"  → {cliente.nome}: +{creditos} pontos creditados "
                    f"(saldo: {cliente.pontos})"
                )

    # ------------------------------------------------------------------ #
    # Tickets de Débito
    # ------------------------------------------------------------------ #
    def _criar_tickets_debito(self, clientes, produtos):
        """
        Cria tickets de débito respeitando as regras:
        - Produto ativo + estabelecimento ativo (RF5.2)
        - Saldo suficiente (RF5.2)
        - Pontos debitados na criação (RF5.3)
        - Recusa/cancelamento devolve pontos (RF5.7, RF5.8)
        """
        maria, joao, ana = clientes

        # Filtrar produtos ativos de estabelecimentos ativos
        produtos_disponiveis = [
            p for p in produtos
            if p.ativo and p.estabelecimento.ativo
        ]

        if not produtos_disponiveis:
            self.stdout.write(
                self.style.WARNING("  Nenhum produto disponível para débito.")
            )
            return

        tickets_data = [
            # MARIA resgata "Café com Pão na Chapa" (padaria) - APROVADO
            {
                "cliente": maria,
                "produto_nome": "Café com Pão na Chapa",
                "status_final": "APROVADO",
            },
            # MARIA resgata "Sobremesa do Dia" (restaurante) - CONCLUIDO (entregue)
            {
                "cliente": maria,
                "produto_nome": "Sobremesa do Dia",
                "status_final": "CONCLUIDO",
            },
            # JOAO resgata "Bolo de Cenoura Fatia" (padaria) - ABERTO
            {
                "cliente": joao,
                "produto_nome": "Bolo de Cenoura Fatia",
                "status_final": "ABERTO",
            },
            # ANA resgata "Marmita Executiva" (restaurante) - RECUSADO (pontos devolvidos)
            {
                "cliente": ana,
                "produto_nome": "Marmita Executiva",
                "status_final": "RECUSADO",
            },
        ]

        for td in tickets_data:
            produto = next(
                (p for p in produtos_disponiveis if p.nome == td["produto_nome"]),
                None,
            )
            if not produto:
                self.stdout.write(
                    f"  Produto '{td['produto_nome']}' não encontrado/disponível. Pulando."
                )
                continue

            cliente = td["cliente"]
            pontos_custo = produto.pontos

            # Verificar saldo suficiente
            if cliente.pontos < pontos_custo:
                self.stdout.write(
                    f"  {cliente.nome} sem saldo para '{produto.nome}' "
                    f"({cliente.pontos} < {pontos_custo}). Pulando."
                )
                continue

            # Debitar pontos na criação (RF5.3)
            cliente.pontos -= pontos_custo
            cliente.save()

            ticket = TicketDebito.objects.create(
                cliente=cliente,
                produto=produto,
                pontos=pontos_custo,
                status=td["status_final"],
            )

            # Se recusado ou cancelado, devolver pontos (RF5.7, RF5.8)
            if td["status_final"] in ("RECUSADO", "CANCELADO"):
                cliente.pontos += pontos_custo
                cliente.save()

            self.stdout.write(
                f"  Ticket débito: {ticket.codigo} | {cliente.nome} → "
                f"'{produto.nome}' | {pontos_custo}pts | "
                f"Status: {td['status_final']} | Saldo: {cliente.pontos}"
            )

    # ------------------------------------------------------------------ #
    # Resumo final
    # ------------------------------------------------------------------ #
    def _imprimir_resumo(self):
        self.stdout.write("\n" + "=" * 60)
        self.stdout.write("DADOS DE LOGIN DOS USUÁRIOS")
        self.stdout.write("=" * 60)
        self.stdout.write(f"Senha padrão para todos: {self.SENHA_PADRAO}")
        self.stdout.write("-" * 60)

        self.stdout.write("\n📋 ADMINISTRADORES:")
        for admin in Administrador.objects.select_related(
            "usuario", "estabelecimento"
        ).all():
            self.stdout.write(
                f"  Email: {admin.usuario.email}\n"
                f"    Nome: {admin.nome}\n"
                f"    Estabelecimento: {admin.estabelecimento.nome}\n"
                f"    Super user: {'Sim' if admin.super_user else 'Não'}\n"
            )

        self.stdout.write("\n👤 CLIENTES:")
        for cliente in Cliente.objects.select_related("usuario").all():
            self.stdout.write(
                f"  Email: {cliente.usuario.email}\n"
                f"    Nome: {cliente.nome}\n"
                f"    Pontos: {cliente.pontos}\n"
            )

        self.stdout.write("-" * 60)
        self.stdout.write(
            f"Estabelecimentos: {Estabelecimento.objects.count()}\n"
            f"Produtos: {Produto.objects.count()}\n"
            f"Tickets de crédito: {TicketCredito.objects.count()}\n"
            f"Tickets de débito: {TicketDebito.objects.count()}"
        )
        self.stdout.write("=" * 60)
