"""Carga alimentar de demonstração, repetível e independente de serviços externos."""

from datetime import timedelta
from decimal import Decimal, ROUND_UP
from pathlib import Path
from io import BytesIO

from django.core.files.base import ContentFile, File
from django.core.files.storage import default_storage
from unicodedata import normalize

from constance import config
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import F
from django.utils import timezone
from django.utils.text import slugify
from PIL import Image, ImageDraw, ImageFont

from core.seed_data import (
    ATENDENTES,
    CLIENTES,
    DOMINIO,
    ESTABELECIMENTOS,
    GERENTES,
    LEGADO,
    PRODUTOS_LEGADOS,
    SENHA_PADRAO,
    cnpj_teste,
    cpf_teste,
)
from estabelecimentos.models import Estabelecimento
from produtos.models import Produto
from tickets.models import TicketCredito, TicketDebito
from usuarios.models import Administrador, Cliente, Usuario

ASSETS = Path(__file__).resolve().parents[2] / "seed_assets"


class Command(BaseCommand):
    help = "Cria dados alimentícios de teste, imagens e arquivo de acessos sem duplicar tickets."

    def add_arguments(self, parser):
        parser.add_argument(
            "--arquivo-logins",
            type=Path,
            default=Path(settings.BASE_DIR) / "ACESSOS_TESTE.local.md",
            help="Destino do relatório de todos os usuários (padrão: /app/ACESSOS_TESTE.local.md).",
        )

        parser.add_argument(
            "--sem-relatorio",
            action="store_true",
            help="Não grava relatório de senhas no servidor.",
        )

    def handle(self, *args, **options):
        if settings.ENV != "development" and not settings.ALLOW_DEMO_DATA:
            raise CommandError(
                "Dados de teste exigem DJANGO_ENV=development ou ALLOW_DEMO_DATA=true."
            )
        if settings.ENV != "development" and len(settings.DEMO_PASSWORD) < 12:
            raise CommandError(
                "Defina DEMO_PASSWORD com pelo menos 12 caracteres para a demonstração hospedada."
            )
        self.senha = settings.DEMO_PASSWORD or SENHA_PADRAO
        self.taxa = Decimal(str(config.PONTOS_POR_REAL_GASTO))
        cashback = Decimal(str(config.PORCENTAGEM_CASHBACK))
        if self.taxa <= 0 or cashback <= 0:
            raise CommandError(
                "PONTOS_POR_REAL_GASTO e PORCENTAGEM_CASHBACK devem ser positivos."
            )
        for dado in ESTABELECIMENTOS:
            imagens = [Path(f"{dado['chave']}.jpg")]
            imagens.extend(
                Path("produtos") / f"{dado['chave']}-{slugify(nome)}.jpg"
                for nome, _ in dado["produtos"]
            )
            for imagem in imagens:
                if not (ASSETS / imagem).is_file():
                    raise CommandError(f"Imagem de demonstração ausente: {imagem}")
        self.agora = timezone.now()
        self.novas_contas = set()
        self.senhas_conhecidas = set()
        self.novos_creditos = self.novos_debitos = 0
        with transaction.atomic():
            estabelecimentos, produtos = self._catalogo()
            self._equipe(estabelecimentos)
            clientes = self._clientes()
            self._tickets(clientes, estabelecimentos, produtos)
            if not options["sem_relatorio"]:
                self._relatorio(options["arquivo_logins"])
        self.stdout.write(
            self.style.SUCCESS(
                f"Carga concluída: 6 estabelecimentos alimentícios, 24 produtos, "
                f"12 funcionários, 8 clientes e 1 superusuário de demonstração.\n"
                f"Novos registros: {len(self.novas_contas)} usuários, "
                f"{self.novos_creditos} créditos e {self.novos_debitos} resgates.\n"
                "Consulte os emails em docs/acessos_teste.md. "
                "As senhas preexistentes foram preservadas."
            )
        )

    def _imagem(self, chave, pasta, subpasta_origem=""):
        relativo = Path(pasta) / "demo" / f"{chave}.jpg"
        nome = relativo.as_posix()
        if not default_storage.exists(nome):
            with (ASSETS / subpasta_origem / f"{chave}.jpg").open("rb") as origem:
                return default_storage.save(nome, File(origem))
        return nome

    def _catalogo(self):
        estabelecimentos, produtos = [], []
        for i, dado in enumerate(ESTABELECIMENTOS):
            cnpj = cnpj_teste(i + 1)
            estabelecimento = Estabelecimento.objects.filter(cnpj=cnpj).first()
            if estabelecimento is None and dado["chave"] in LEGADO:
                antigo_cnpj, antigo_nome = LEGADO[dado["chave"]]
                estabelecimento = Estabelecimento.objects.filter(
                    cnpj=antigo_cnpj, nome=antigo_nome
                ).first()
            if estabelecimento is None:
                estabelecimento = Estabelecimento(cnpj=cnpj)
            estabelecimento.cnpj = cnpj
            estabelecimento.nome = dado["nome"]
            estabelecimento.endereco = dado["endereco"]
            estabelecimento.telefone = f"+553899100{1000 + i}"
            estabelecimento.descricao = dado["descricao"]
            estabelecimento.ativo = dado["ativo"]
            estabelecimento.horario_funcionamento = {
                dia: dado["horario"]
                for dia in ("segunda", "terca", "quarta", "quinta", "sexta", "sabado")
            }
            estabelecimento.horario_funcionamento["domingo"] = "Fechado"
            estabelecimento.logotipo = self._imagem(dado["chave"], "logotipos")
            estabelecimento.full_clean()
            estabelecimento.save()
            estabelecimentos.append(estabelecimento)
            grupo = []
            for j, (nome, preco) in enumerate(dado["produtos"]):
                produto = Produto.objects.filter(
                    estabelecimento=estabelecimento, nome=nome
                ).first()
                if produto is None and nome in PRODUTOS_LEGADOS:
                    produto = Produto.objects.filter(
                        estabelecimento=estabelecimento, nome=PRODUTOS_LEGADOS[nome]
                    ).first()
                if produto is None:
                    produto = Produto(estabelecimento=estabelecimento)
                produto.nome = nome
                produto.preco = Decimal(preco)
                produto.descricao = (
                    f"{nome}, preparado na casa. Foto ilustrativa do produto."
                )
                produto.imagem = self._imagem(
                    f"{dado['chave']}-{slugify(nome)}", "produtos", "produtos"
                )
                # Um produto pausado em cada estabelecimento demonstra a indisponibilidade.
                produto.ativo = j != 3
                produto.full_clean()
                produto.save()  # O modelo calcula o preço em pontos com o cashback configurado.
                grupo.append(produto)
            produtos.append(grupo)
        return estabelecimentos, produtos

    def _usuario(self, email, tipo, plataforma=False):
        usuario, criado = Usuario.objects.get_or_create(
            email=email,
            defaults={
                "tipo_usuario": tipo,
                "is_staff": plataforma,
                "is_superuser": plataforma,
            },
        )
        if not criado and (
            usuario.tipo_usuario != tipo
            or usuario.is_superuser != plataforma
            or usuario.is_staff != plataforma
        ):
            raise CommandError(
                f"Conta de demonstração em conflito: {email}. Nenhuma permissão foi alterada."
            )
        if criado:
            usuario.set_password(self.senha)
            usuario.save()
            self.novas_contas.add(email)
            self.senhas_conhecidas.add(email)
        return usuario

    def _equipe(self, estabelecimentos):
        # Também possui perfil para acessar /me e o painel, além do Django Admin.
        superusuario = self._usuario(
            f"plataforma@{DOMINIO}", Usuario.TipoUsuario.ADMINISTRADOR, plataforma=True
        )
        perfil, _ = Administrador.objects.get_or_create(
            usuario=superusuario,
            defaults={
                "nome": "Equipe JanuPoints",
                "cpf": cpf_teste(1),
                "estabelecimento": estabelecimentos[0],
                "super_user": True,
            },
        )
        for i, estabelecimento in enumerate(estabelecimentos):
            for j, (cargo, nomes) in enumerate(
                (("gerente", GERENTES), ("atendente", ATENDENTES))
            ):
                usuario = self._usuario(
                    f"{cargo}.{ESTABELECIMENTOS[i]['chave']}@{DOMINIO}",
                    Usuario.TipoUsuario.ADMINISTRADOR,
                )
                perfil, _ = Administrador.objects.get_or_create(
                    usuario=usuario,
                    defaults={
                        "nome": nomes[i],
                        "cpf": cpf_teste(10 + i * 2 + j),
                        "estabelecimento": estabelecimento,
                        "super_user": cargo == "gerente",
                    },
                )
                if (
                    perfil.estabelecimento_id != estabelecimento.pk
                    or perfil.super_user != (cargo == "gerente")
                ):
                    raise CommandError(
                        f"Perfil de demonstração em conflito: {usuario.email}."
                    )

    def _clientes(self):
        clientes = []
        for i, (chave, nome) in enumerate(CLIENTES):
            usuario = self._usuario(f"{chave}@{DOMINIO}", Usuario.TipoUsuario.CLIENTE)
            cliente, _ = Cliente.objects.get_or_create(
                usuario=usuario,
                defaults={
                    "nome": nome,
                    "cpf": cpf_teste(100 + i),
                    "telefone": f"+553899200{1000 + i}",
                    "pontos": 0,
                },
            )
            clientes.append(cliente)
        return clientes

    def _data(self, modelo, ticket, dias, processado):
        criacao = self.agora - timedelta(days=dias)
        atualizacao = criacao + timedelta(hours=2) if processado else criacao
        modelo.objects.filter(pk=ticket.pk).update(
            created_at=criacao, updated_at=atualizacao
        )

    def _cupom(self, codigo, estabelecimento, valor, data):
        relativo = Path("notas_fiscais") / "demo" / f"{codigo}.png"
        nome = relativo.as_posix()
        if not default_storage.exists(nome):
            imagem = Image.new("RGB", (760, 680), "#fffdf5")
            desenho = ImageDraw.Draw(imagem)
            fonte = ImageFont.load_default(size=22)
            linhas = [
                "JANUPOINTS - DEMONSTRACAO",
                "SEM VALOR FISCAL",
                "-" * 44,
                estabelecimento.nome,
                f"CNPJ: {estabelecimento.cnpj}",
                estabelecimento.endereco,
                "-" * 44,
                f"Documento: DEMO-{codigo}",
                f"Data: {data:%d/%m/%Y %H:%M}",
                "",
                "Consumo de alimentos e bebidas",
                f"TOTAL: R$ {valor:.2f}",
                "Pagamento: PIX",
                "-" * 44,
                "Dados ficticios para testes do JanuPoints.",
            ]
            # A fonte embarcada do Pillow não inclui todos os acentos portugueses.
            texto = (
                normalize("NFKD", "\n".join(linhas)).encode("ascii", "ignore").decode()
            )
            desenho.multiline_text(
                (28, 28), texto, fill="#262626", font=fonte, spacing=12
            )
            conteudo = BytesIO()
            imagem.save(conteudo, format="PNG")
            return default_storage.save(nome, ContentFile(conteudo.getvalue()))
        return nome

    def _credito(self, cliente, estabelecimento, codigo, valor, status, dias):
        existente = TicketCredito.objects.filter(codigo=codigo).first()
        if existente:
            if (
                existente.cliente_id != cliente.pk
                or existente.estabelecimento_id != estabelecimento.pk
            ):
                raise CommandError(f"Código de ticket em conflito: {codigo}.")
            # Restaura o comprovante do seed se o storage foi trocado ou esvaziado.
            if existente.imagem and not default_storage.exists(existente.imagem.name):
                existente.imagem = self._cupom(
                    codigo, estabelecimento, existente.preco, existente.data_nota
                )
                # update() não altera o histórico de datas/status do ticket.
                TicketCredito.objects.filter(pk=existente.pk).update(
                    imagem=existente.imagem.name
                )
            return
        pontos = int(valor * self.taxa)
        data = self.agora - timedelta(days=dias, hours=1)
        ticket = TicketCredito.objects.create(
            cliente=cliente,
            estabelecimento=estabelecimento,
            codigo=codigo,
            numero_nota=f"DEMO-{codigo}",
            preco=valor,
            pontos=pontos,
            data_nota=data,
            imagem=self._cupom(codigo, estabelecimento, valor, data),
            status=status,
            observacao={
                "RECUSADO": "Valor informado diverge do comprovante enviado.",
                "CANCELADO": "Solicitação cancelada pelo cliente antes da análise.",
            }.get(status, ""),
        )
        self._data(TicketCredito, ticket, dias, status != "ABERTO")
        if status == "CONCLUIDO":
            Cliente.objects.filter(pk=cliente.pk).update(pontos=F("pontos") + pontos)
        self.novos_creditos += 1

    def _tickets(self, clientes, estabelecimentos, produtos):
        disponiveis = [
            min((p for p in grupo if p.ativo), key=lambda p: p.pontos)
            for grupo in produtos
            if grupo[0].estabelecimento.ativo
        ]
        estados_credito = ["CONCLUIDO"] * 8 + [
            "ABERTO",
            "ABERTO",
            "RECUSADO",
            "CANCELADO",
        ]
        estados_debito = ["ABERTO", "APROVADO", "CONCLUIDO", "RECUSADO", "CANCELADO"]
        for i, cliente in enumerate(clientes[:6]):
            # Serializa alterações no saldo e permite repetir a carga sem reaplicar movimentos.
            cliente = Cliente.objects.select_for_update().get(pk=cliente.pk)
            recompensas = [disponiveis[(i + j) % len(disponiveis)] for j in range(5)]
            custo_total = sum(p.pontos for p in recompensas)
            # Oito notas concluídas financiam os resgates e deixam saldo para novos testes.
            valor_base = (Decimal(custo_total + 800) / self.taxa / 8).quantize(
                Decimal("0.01"), rounding=ROUND_UP
            )
            for n, status in enumerate(estados_credito):
                self._credito(
                    cliente,
                    estabelecimentos[(i + n) % 6],
                    f"JPC{i:02d}{n:03d}",
                    valor_base + Decimal(n),
                    status,
                    30 - n * 2,
                )
            for n, (produto, status) in enumerate(zip(recompensas, estados_debito)):
                codigo = f"JPD{i:02d}{n:03d}"
                existente = TicketDebito.objects.filter(codigo=codigo).first()
                if existente:
                    if (
                        existente.cliente_id != cliente.pk
                        or existente.produto_id != produto.pk
                    ):
                        raise CommandError(f"Código de ticket em conflito: {codigo}.")
                    continue
                cliente.refresh_from_db()
                if cliente.pontos < produto.pontos:
                    raise CommandError(
                        f"Saldo insuficiente em {cliente.usuario.email}; carga revertida."
                    )
                ticket = TicketDebito.objects.create(
                    cliente=cliente,
                    produto=produto,
                    codigo=codigo,
                    pontos=produto.pontos,
                    status=status,
                    observacao={
                        "RECUSADO": "Item indisponível no momento. Pontos devolvidos.",
                        "CANCELADO": "Cliente desistiu do resgate. Pontos devolvidos.",
                    }.get(status, ""),
                )
                if status not in ("RECUSADO", "CANCELADO"):
                    Cliente.objects.filter(pk=cliente.pk).update(
                        pontos=F("pontos") - produto.pontos
                    )
                self._data(TicketDebito, ticket, 5 - n, status != "ABERTO")
                self.novos_debitos += 1
        # Uma cliente com pouco saldo e um cliente novo, sem histórico.
        self._credito(
            clientes[6],
            estabelecimentos[0],
            "JPC06000",
            Decimal("12.50"),
            "CONCLUIDO",
            2,
        )

    def _relatorio(self, caminho):
        linhas = [
            "# Acessos locais do JanuPoints",
            "",
            "Gerado por `python manage.py popular_banco`. Contém todos os usuários deste banco.",
            "As senhas existentes são preservadas. Uma senha só é listada quando validada pelo hash; outras não podem ser recuperadas.",
            "Painel: http://localhost:3000 | Django Admin: http://localhost:8000/admin/ | Clientes: app mobile",
            "",
            "| Email | Nome | Perfil | Estabelecimento | Ativo | Senha |",
            "|---|---|---|---|---|---|",
        ]
        for usuario in Usuario.objects.select_related(
            "administrador__estabelecimento", "cliente"
        ).order_by("email"):
            if hasattr(usuario, "administrador"):
                perfil = usuario.administrador
                nome, estabelecimento = perfil.nome, perfil.estabelecimento.nome
                cargo = (
                    "Superusuário"
                    if usuario.is_superuser
                    else "Gerente" if perfil.super_user else "Atendente"
                )
            elif hasattr(usuario, "cliente"):
                nome, estabelecimento, cargo = usuario.cliente.nome, "—", "Cliente"
            else:
                nome, estabelecimento = "—", "—"
                cargo = "Superusuário" if usuario.is_superuser else usuario.tipo_usuario
            senha = (
                self.senha
                if usuario.email in self.senhas_conhecidas
                or usuario.check_password(self.senha)
                else "Preexistente; não alterada"
            )
            campos = [
                usuario.email,
                nome,
                cargo,
                estabelecimento,
                "Sim" if usuario.is_active else "Não",
                senha,
            ]
            linhas.append(
                "| "
                + " | ".join(
                    str(c).replace("|", "\\|").replace("\n", " ") for c in campos
                )
                + " |"
            )
        try:
            caminho.parent.mkdir(parents=True, exist_ok=True)
            caminho.write_text("\n".join(linhas) + "\n", encoding="utf-8")
        except OSError as erro:
            raise CommandError(
                f"Não foi possível gravar os acessos em {caminho}: {erro}"
            ) from erro
