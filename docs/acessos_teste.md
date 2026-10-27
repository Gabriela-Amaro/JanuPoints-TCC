# Acessos de teste do JanuPoints

Contas fictícias criadas por `popular_banco`. No ambiente **local**, a senha inicial de todas as contas abaixo é `Janu@2026`. No deploy Render, as contas novas usam a senha informada em `DEMO_PASSWORD`; veja o [guia de hospedagem](hospedagem.md).

Execute em `app/backend`:

```bash
make seed
```

O comando também gera `app/backend/app/ACESSOS_TESTE.local.md` com todos os usuários presentes no banco. Senhas preexistentes não são redefinidas: consulte esse relatório para saber se a senha de teste ainda é válida.

## Funcionários e plataforma

Gerentes e atendentes acessam http://localhost:3000. Os gerentes têm `super_user=True` no estabelecimento; os atendentes analisam tickets e criam recompensas, conforme as permissões da API. Apenas o superusuário da plataforma possui acesso ao Django Admin em http://localhost:8000/admin/ e acesso global.

| Email | Nome | Perfil | Estabelecimento |
|---|---|---|---|
| plataforma@demo.janupoints.test | Equipe JanuPoints | Superusuário | Todos |
| gerente.padaria@demo.janupoints.test | Carlos Mendes | Gerente | Padaria Pão Dourado |
| atendente.padaria@demo.janupoints.test | Lucas Souza | Atendente | Padaria Pão Dourado |
| gerente.restaurante@demo.janupoints.test | Fernanda Oliveira | Gerente | Restaurante Sabor da Terra |
| atendente.restaurante@demo.janupoints.test | Camila Ribeiro | Atendente | Restaurante Sabor da Terra |
| gerente.hamburgueria@demo.janupoints.test | Roberto Silva | Gerente | Hamburgueria Brasa do Norte |
| atendente.hamburgueria@demo.janupoints.test | Pedro Martins | Atendente | Hamburgueria Brasa do Norte |
| gerente.pizzaria@demo.janupoints.test | Juliana Costa | Gerente | Pizzaria Forno da Praça |
| atendente.pizzaria@demo.janupoints.test | Larissa Gomes | Atendente | Pizzaria Forno da Praça |
| gerente.cafeteria@demo.janupoints.test | Beatriz Rocha | Gerente | Cafeteria Grão do São Francisco |
| atendente.cafeteria@demo.janupoints.test | Bruno Teixeira | Atendente | Cafeteria Grão do São Francisco |
| gerente.sorveteria@demo.janupoints.test | Rafael Almeida | Gerente | Sorveteria Doce Verão |
| atendente.sorveteria@demo.janupoints.test | Patrícia Nunes | Atendente | Sorveteria Doce Verão |

## Clientes (aplicativo mobile)

| Email | Nome | Cenário inicial |
|---|---|---|
| maria@demo.janupoints.test | Maria Santos | Saldo para resgatar e histórico de créditos/resgates |
| joao@demo.janupoints.test | João Pereira | Saldo para resgatar e histórico de créditos/resgates |
| ana@demo.janupoints.test | Ana Lima | Saldo para resgatar e histórico de créditos/resgates |
| paulo@demo.janupoints.test | Paulo Ferreira | Saldo para resgatar e histórico de créditos/resgates |
| julia@demo.janupoints.test | Júlia Barbosa | Saldo para resgatar e histórico de créditos/resgates |
| marcos@demo.janupoints.test | Marcos Azevedo | Saldo para resgatar e histórico de créditos/resgates |
| bia@demo.janupoints.test | Beatriz Dias | Poucos pontos; insuficientes para resgatar |
| novo@demo.janupoints.test | Gabriel Costa | Sem pontos e sem histórico |

## Dados e repetição

- 6 estabelecimentos em Januária/MG, com endereços fictícios: padaria, restaurante, hamburgueria, pizzaria, cafeteria e sorveteria.
- 24 produtos, cada um com uma foto ilustrativa própria; o quarto item de cada estabelecimento está pausado.
- A sorveteria está inativa para testar indisponibilidade; os resgates pertencem a estabelecimentos ativos.
- 73 créditos (concluídos, abertos, recusados e cancelados) e 30 resgates (abertos, aprovados, concluídos, recusados e cancelados).
- CPFs e CNPJs sintéticos com dígitos verificadores válidos. Os documentos fiscais gerados trazem a indicação “SEM VALOR FISCAL”.
- Os saldos resultam dos créditos concluídos menos os resgates abertos, aprovados e concluídos; resgates recusados/cancelados não consomem saldo.
- As regras de conversão usam os valores atuais do Constance. Valores dos tickets são calculados para financiar os resgates sem alterar a configuração do sistema.
- Reexecutar preserva senhas e movimentos já processados. O catálogo demonstrativo é reaplicado.
- Os registros exatos da farmácia e livraria do comando antigo são atualizados para alimentação, preservando vínculos. Usuários anteriores aparecem no relatório local com seus acessos originais.
