"""Catálogo fictício de demonstração. Não contém dados pessoais reais."""

SENHA_PADRAO = "Janu@2026"
DOMINIO = "demo.janupoints.test"

# Chave, nome, endereço fictício, descrição, horário, ativo, produtos (nome, preço).
ESTABELECIMENTOS = [
    {
        "chave": "padaria",
        "nome": "Padaria Pão Dourado",
        "endereco": "Rua das Flores, 123 - Centro, Januária/MG",
        "descricao": "Pães artesanais, quitandas mineiras e café passado na hora.",
        "horario": "06:00-19:00",
        "ativo": True,
        "produtos": [
            ("Café com Pão na Chapa", "12.00"),
            ("Fatia de Bolo de Cenoura", "9.50"),
            ("Cesta de Pães de Queijo", "18.00"),
            ("Cesta de Café da Manhã", "45.00"),
        ],
    },
    {
        "chave": "restaurante",
        "nome": "Restaurante Sabor da Terra",
        "endereco": "Avenida do Sol, 240 - Centro, Januária/MG",
        "descricao": "Almoço caseiro com arroz, feijão, grelhados e saladas frescas.",
        "horario": "11:00-15:00",
        "ativo": True,
        "produtos": [
            ("Marmita Executiva", "22.00"),
            ("Pudim de Leite", "8.00"),
            ("Prato Feito com Frango", "28.00"),
            ("Almoço Completo", "35.00"),
        ],
    },
    {
        "chave": "hamburgueria",
        "nome": "Hamburgueria Brasa do Norte",
        "endereco": "Rua do Cerrado, 85 - Vila Nova, Januária/MG",
        "descricao": "Hambúrgueres artesanais na brasa e batatas crocantes.",
        "horario": "18:00-23:00",
        "ativo": True,
        "produtos": [
            ("Cheeseburger Artesanal", "25.00"),
            ("Porção de Batata Frita", "14.00"),
            ("Combo Brasa com Batatas", "36.00"),
            ("Hambúrguer Duplo", "34.00"),
        ],
    },
    {
        "chave": "pizzaria",
        "nome": "Pizzaria Forno da Praça",
        "endereco": "Praça das Mangueiras, 32 - Centro, Januária/MG",
        "descricao": "Pizzas de fermentação lenta com molho de tomate da casa.",
        "horario": "18:00-23:30",
        "ativo": True,
        "produtos": [
            ("Pizza Margherita Individual", "24.00"),
            ("Fatia de Pizza Margherita", "9.00"),
            ("Pizza Margherita Família", "58.00"),
            ("Pizza Extra Queijo", "62.00"),
        ],
    },
    {
        "chave": "cafeteria",
        "nome": "Cafeteria Grão do São Francisco",
        "endereco": "Rua do Porto, 67 - Centro, Januária/MG",
        "descricao": "Cafés especiais de Minas, cappuccinos e croissants artesanais.",
        "horario": "08:00-20:00",
        "ativo": True,
        "produtos": [
            ("Cappuccino da Casa", "12.00"),
            ("Croissant Amanteigado", "10.00"),
            ("Combo Cappuccino e Croissant", "20.00"),
            ("Cappuccino Grande", "16.00"),
        ],
    },
    {
        "chave": "sorveteria",
        "nome": "Sorveteria Doce Verão",
        "endereco": "Avenida das Palmeiras, 410 - Bela Vista, Januária/MG",
        "descricao": "Sorvetes e açaí com frutas. Temporariamente fechada para reforma.",
        "horario": "13:00-21:00",
        "ativo": False,
        "produtos": [
            ("Açaí com Banana e Granola", "18.00"),
            ("Taça com Duas Bolas de Sorvete", "12.00"),
            ("Açaí com Morango", "22.00"),
            ("Taça Especial de Verão", "25.00"),
        ],
    },
]

GERENTES = [
    "Carlos Mendes",
    "Fernanda Oliveira",
    "Roberto Silva",
    "Juliana Costa",
    "Beatriz Rocha",
    "Rafael Almeida",
]
ATENDENTES = [
    "Lucas Souza",
    "Camila Ribeiro",
    "Pedro Martins",
    "Larissa Gomes",
    "Bruno Teixeira",
    "Patrícia Nunes",
]
CLIENTES = [
    ("maria", "Maria Santos"),
    ("joao", "João Pereira"),
    ("ana", "Ana Lima"),
    ("paulo", "Paulo Ferreira"),
    ("julia", "Júlia Barbosa"),
    ("marcos", "Marcos Azevedo"),
    ("bia", "Beatriz Dias"),
    ("novo", "Gabriel Costa"),
]

# Apenas registros exatos do comando antigo são atualizados; dados alheios são preservados.
LEGADO = {
    "padaria": ("11.222.333/0001-81", "Padaria Pão Dourado"),
    "restaurante": ("44.555.666/0001-72", "Restaurante Sabor da Terra"),
    "hamburgueria": ("77.888.999/0001-63", "Farmácia VidaSaúde"),
    "pizzaria": ("12.345.678/0001-95", "Livraria Cultura Viva"),
}
PRODUTOS_LEGADOS = {
    "Fatia de Bolo de Cenoura": "Bolo de Cenoura Fatia",
    "Cesta de Pães de Queijo": "Pão de Queijo (pacote 10 un.)",
    "Cesta de Café da Manhã": "Kit Festa 50 Salgados",
    "Pudim de Leite": "Sobremesa do Dia",
    "Almoço Completo": "Combo Almoço Completo",
    "Cheeseburger Artesanal": "Kit Protetor Solar",
    "Porção de Batata Frita": "Vitamina C 30 comprimidos",
    "Pizza Margherita Individual": "Vale-livro R$30",
}


def cpf_teste(indice):
    """Identificador sintético com dígitos verificadores válidos."""
    base = f"98765{indice:04d}"
    for tamanho in (9, 10):
        resto = (
            sum(int(n) * peso for n, peso in zip(base, range(tamanho + 1, 1, -1))) % 11
        )
        base += str(0 if resto < 2 else 11 - resto)
    return f"{base[:3]}.{base[3:6]}.{base[6:9]}-{base[9:]}"


def cnpj_teste(indice):
    base = f"98765{indice:03d}0001"
    for pesos in (
        (5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2),
        (6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2),
    ):
        resto = sum(int(n) * peso for n, peso in zip(base, pesos)) % 11
        base += str(0 if resto < 2 else 11 - resto)
    return f"{base[:2]}.{base[2:5]}.{base[5:8]}/{base[8:12]}-{base[12:]}"


def contas_teste():
    yield (f"plataforma@{DOMINIO}", "Equipe JanuPoints", "Superusuário", "Todos")
    for i, estabelecimento in enumerate(ESTABELECIMENTOS):
        for cargo, nomes in (("gerente", GERENTES), ("atendente", ATENDENTES)):
            yield (
                f"{cargo}.{estabelecimento['chave']}@{DOMINIO}",
                nomes[i],
                cargo.title(),
                estabelecimento["nome"],
            )
    for chave, nome in CLIENTES:
        yield (f"{chave}@{DOMINIO}", nome, "Cliente", "Aplicativo mobile")
