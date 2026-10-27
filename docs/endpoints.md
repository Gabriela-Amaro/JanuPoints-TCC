[Visão Geral](../README.md) | [Diagrama Entidade-Relacionamento](../docs/diagram_er.md) | [Diagrama de Classes](../docs/diagrama_classes.md) | [Requisitos Funcionais e Não Funcionais](../docs/requisitos.md) | [Fluxo de Requisições](../docs/fluxo_requisicao.md)

---

# Endpoints da API

## 1. Convenções

A API é servida pelo backend Django e utiliza o prefixo `/api/` para as rotas de aplicação.

```text
http://localhost:8000/api/
```

As rotas protegidas utilizam:

```http
Authorization: Bearer <access_token>
```

As listagens atuais não têm paginação configurada e retornam arrays JSON. As rotas de detalhe respeitam os filtros por perfil aplicados nas listagens, podendo retornar `404` para objetos fora desse conjunto.

As respostas comuns usam JSON. O envio de nota fiscal e o upload de imagens utilizam `multipart/form-data`.

### Formatos de status

#### Ticket de crédito

- `ABERTO`
- `CONCLUIDO`
- `CANCELADO`
- `RECUSADO`

#### Ticket de débito

- `ABERTO`
- `APROVADO`
- `CONCLUIDO`
- `CANCELADO`
- `RECUSADO`

---

## 2. Autenticação

### `POST /api/auth/token/`

Autentica um usuário e retorna tokens JWT.

**Autorização:** pública.

#### Corpo

```json
{
  "email": "cliente@exemplo.com",
  "password": "senha-segura"
}
```

#### Resposta

```json
{
  "refresh": "<refresh_token>",
  "access": "<access_token>"
}
```

O login utiliza email como identificador do usuário.

### `POST /api/auth/token/refresh/`

Gera um novo access token usando o refresh token. A rotação está habilitada: a resposta contém `access` e um novo `refresh`, que deve substituir o anterior. O refresh usado é colocado na blacklist. No ambiente de desenvolvimento, ambos os tokens têm validade configurada de um dia.

**Autorização:** pública, com refresh token válido.

#### Corpo

```json
{
  "refresh": "<refresh_token>"
}
```

### `POST /api/auth/logout/`

Adiciona o refresh token à blacklist.

**Autorização:** refresh token válido; o `TokenBlacklistView` não exige access token. O logout adiciona o refresh token à blacklist.

#### Corpo

```json
{
  "refresh": "<refresh_token>"
}
```

---

## 3. Usuário autenticado

### `GET /api/me/`

Retorna os dados do usuário autenticado.

**Autorização:** usuário autenticado.

#### Resposta para cliente

```json
{
  "id": 1,
  "email": "cliente@exemplo.com",
  "tipo_usuario": "CLIENTE",
  "is_active": true,
  "nome": "Nome do Cliente",
  "cpf": "123.456.789-00",
  "telefone": "+5538999998888",
  "pontos": 120
}
```

#### Resposta para administrador

```json
{
  "id": 2,
  "email": "admin@empresa.com",
  "tipo_usuario": "ADMINISTRADOR",
  "is_active": true,
  "nome": "Administrador",
  "cpf": "987.654.321-00",
  "super_user": true,
  "estabelecimento": {
    "id": 4,
    "nome": "Estabelecimento Parceiro"
  }
}
```

Se o usuário não tiver o perfil correspondente, `/api/me/` retorna os dados base e um campo `warning`. Isso pode ocorrer com um superusuário criado sem perfil `Administrador`.

### `PUT /api/usuarios/change-password/`

Altera a senha do usuário autenticado.

**Autorização:** usuário autenticado.

Também aceita `PATCH`, exigindo os mesmos três campos:

```json
{
  "old_password": "senha-atual",
  "new_password": "nova-senha-segura",
  "new_password2": "nova-senha-segura"
}
```

#### Resposta

```json
{
  "detail": "Senha alterada com sucesso."
}
```

---

## 4. Clientes

### `POST /api/clientes/cadastro/`

Cria um cliente e seu usuário de autenticação.

**Autorização:** pública.

#### Corpo

```json
{
  "email": "novo.cliente@exemplo.com",
  "password": "senha-segura",
  "password2": "senha-segura",
  "nome": "Novo Cliente",
  "cpf": "123.456.789-00",
  "telefone": "+5538999998888"
}
```

#### Resposta `201 Created`

Retorna `usuario` (objeto com `id`, `email`, `tipo_usuario`, `is_active`, `created_at`, `updated_at`), `email`, `nome`, `cpf`, `telefone` e `pontos`. O CPF é recebido no cadastro; nas atualizações de perfil, CPF e pontos são somente leitura. Senhas não são retornadas.

O `{id}` usado em `/api/clientes/{id}/` é o ID do usuário, pois a relação um-para-um é a chave primária do perfil.

### `GET /api/clientes/{id}/`

Retorna os dados de um cliente.

**Autorização:** cliente autenticado, apenas o proprietário do perfil.

### `PUT /api/clientes/{id}/`

Atualiza os dados editáveis do cliente.

**Autorização:** cliente autenticado, apenas o proprietário do perfil.

### `PATCH /api/clientes/{id}/`

Atualiza parcialmente os dados do cliente.

**Autorização:** cliente autenticado, apenas o proprietário do perfil.

#### Exemplo

```json
{
  "nome": "Nome atualizado",
  "email": "atualizado@exemplo.com",
  "telefone": "+5538888887777"
}
```

### `DELETE /api/clientes/{id}/`

Exclui o usuário e o perfil do cliente.

**Autorização:** cliente autenticado, apenas o proprietário do perfil.

**Resposta:** `204 No Content`.

---

## 5. Estabelecimentos

Os endpoints são registrados por `DefaultRouter`.

### `GET /api/estabelecimentos/`

Lista estabelecimentos disponíveis para o usuário autenticado.

**Autorização:** usuário autenticado.

Comportamento:

- superusuário: todos os estabelecimentos;
- administrador: estabelecimento associado;
- cliente: estabelecimentos ativos.

#### Busca por nome

```text
GET /api/estabelecimentos/?search=pizzaria
```

### `GET /api/estabelecimentos/{id}/`

Retorna os detalhes de um estabelecimento.

**Autorização:** usuário autenticado.

#### Resposta para administrador ou superusuário

Para clientes, `ativo`, `created_at` e `updated_at` são omitidos. URLs de imagem podem ser absolutas conforme o contexto da requisição. Os exemplos abaixo são ilustrativos. Com `USE_TZ=False`, não se deve presumir que as datas de resposta estejam em UTC.

```json
{
  "id": 1,
  "nome": "Estabelecimento Parceiro",
  "endereco": "Rua Principal, 100",
  "telefone": "+553833334444",
  "descricao": "Descrição do parceiro",
  "logotipo": "/media/logotipos/logo.jpg",
  "cnpj": "12.345.678/0001-99",
  "horario_funcionamento": {
    "segunda": "08:00-18:00"
  },
  "ativo": true,
  "created_at": "2026-01-01T12:00:00",
  "updated_at": "2026-01-01T12:00:00"
}
```

### `PUT /api/estabelecimentos/{id}/`

Atualiza um estabelecimento.

**Autorização:** superusuário da plataforma ou administrador do estabelecimento com `super_user=True`.

### `PATCH /api/estabelecimentos/{id}/`

Atualiza parcialmente um estabelecimento.

**Autorização:** superusuário da plataforma ou administrador do estabelecimento com `super_user=True`.

### `DELETE /api/estabelecimentos/{id}/`

Exclui um estabelecimento.

**Autorização:** superusuário da plataforma ou administrador do estabelecimento com `super_user=True`.

O CNPJ é somente leitura. O cadastro de novos estabelecimentos não é exposto por este viewset.

---

## 6. Produtos e recompensas

### `GET /api/produtos/`

Lista produtos conforme o perfil autenticado.

**Autorização:** usuário autenticado.

Comportamento:

- superusuário: todos os produtos;
- administrador: produtos do estabelecimento associado;
- cliente: produtos ativos de estabelecimentos ativos.

Para clientes, as respostas omitem `preco`, `ativo`, `created_at` e `updated_at`; o custo de resgate é `pontos`. Também há campos relacionados `estabelecimento_nome` e `estabelecimento_logo`.

#### Busca por nome

```text
GET /api/produtos/?search=cafe
```

#### Filtro por estabelecimento

```text
GET /api/produtos/?estabelecimento=1
```

### `POST /api/produtos/`

Cria uma recompensa.

**Autorização:** administrador autenticado com perfil de estabelecimento, mesmo com `super_user=False`. O estabelecimento é preenchido pelo backend e não deve ser enviado.

#### Corpo JSON

```json
{
  "nome": "Café especial",
  "descricao": "Café coado",
  "preco": "10.00",
  "ativo": true
}
```

#### Upload de imagem

Para enviar uma imagem, use `multipart/form-data` com os campos:

```text
nome
descricao
preco
ativo
imagem
```

O campo `pontos` é calculado pelo modelo e não deve ser enviado como valor de negócio.

### `GET /api/produtos/{id}/`

Retorna uma recompensa.

**Autorização:** usuário autenticado.

### `PUT /api/produtos/{id}/`

Atualiza uma recompensa.

**Autorização:** superusuário da plataforma ou administrador do estabelecimento com `super_user=True`.

### `PATCH /api/produtos/{id}/`

Atualiza parcialmente uma recompensa.

**Autorização:** superusuário da plataforma ou administrador do estabelecimento com `super_user=True`.

### `DELETE /api/produtos/{id}/`

Exclui uma recompensa.

**Autorização:** superusuário da plataforma ou administrador do estabelecimento com `super_user=True`.

### Cálculo de pontos

Ao salvar um produto, o backend calcula:

```text
pontos = int(preco * 100 / PORCENTAGEM_CASHBACK)
```

O valor padrão de `PORCENTAGEM_CASHBACK` é `5.0`, configurável no Constance. O cálculo é feito ao salvar um produto com preço não zero; alterar a configuração não recalcula automaticamente os produtos existentes. Use `recalcular_pontos_produtos` para reaplicar a regra.

---

## 7. Tickets de crédito

### `GET /api/tickets/credito/`

Lista tickets de crédito conforme o usuário.

**Autorização:** usuário autenticado.

- cliente: próprios tickets;
- administrador: tickets do estabelecimento;
- superusuário: todos os tickets.

### `POST /api/tickets/credito/`

Cria um ticket de acúmulo.

**Autorização:** cliente autenticado.

**Content-Type:** `multipart/form-data`.

#### Campos

```text
estabelecimento: ID do estabelecimento
imagem: imagem da nota fiscal
preco: valor da nota
data_nota: data/hora ISO 8601 (ex.: 2026-10-27T10:00:00)
numero_nota: número da nota
```

Validações:

- `preco` deve ser maior que zero;
- o dia de `data_nota` não pode ser posterior ao dia atual;
- a combinação de estabelecimento e número da nota não pode estar duplicada;
- o estabelecimento precisa estar ativo.

O ticket é criado com status `ABERTO`; `pontos = int(float(preco) * PONTOS_POR_REAL_GASTO)`, cujo fator padrão é `1.0`. A resposta `201` contém `id`, `cliente`, `codigo`, `status`, `estabelecimento`, `imagem`, `preco`, `data_nota` e `numero_nota`. Para obter pontos, observação, datas e campos relacionados, consulte o detalhe.

O mobile envia a data como `AAAA-MM-DD`. Envie a imagem da nota junto aos demais campos. O serializer verifica a combinação de estabelecimento e número da nota para rejeitar duplicidades.

### `GET /api/tickets/credito/{id}/`

Retorna os detalhes de um ticket de crédito.

**Autorização:** proprietário, administrador do estabelecimento ou superusuário.

### `POST /api/tickets/credito/{id}/cancelar/`

Cancela um ticket de crédito aberto.

**Autorização:** proprietário do ticket.

### `POST /api/tickets/credito/{id}/aprovar/`

Aprova o ticket e credita os pontos ao cliente.

**Autorização:** administrador do estabelecimento ou superusuário.

Efeitos:

- status passa para `CONCLUIDO`;
- pontos são adicionados ao cliente;
- atualização ocorre em transação atômica.

### `POST /api/tickets/credito/{id}/recusar/`

Recusa um ticket aberto.

**Autorização:** administrador do estabelecimento ou superusuário.

#### Corpo opcional

```json
{
  "motivo": "Dados inconsistentes com a nota fiscal."
}
```

---

## 8. Tickets de débito

### `GET /api/tickets/debito/`

Lista tickets de débito conforme o usuário.

**Autorização:** usuário autenticado.

- cliente: próprios tickets;
- administrador: tickets de produtos do estabelecimento;
- superusuário: todos os tickets.

### `POST /api/tickets/debito/`

Cria uma solicitação de resgate.

**Autorização:** cliente autenticado.

#### Corpo

```json
{
  "produto": 10
}
```

Validações:

- produto ativo;
- estabelecimento ativo;
- saldo suficiente.

Na criação, os pontos do produto são debitados do cliente e o ticket é criado com status `ABERTO`. O valor em pontos é preservado no ticket mesmo que o catálogo seja alterado depois. A resposta `201` contém apenas `id` e `produto`; consulte o detalhe para obter status, código, pontos e campos relacionados.

### `GET /api/tickets/debito/{id}/`

Retorna os detalhes de um ticket de débito.

**Autorização:** proprietário, administrador do estabelecimento ou superusuário.

### `POST /api/tickets/debito/{id}/cancelar/`

Cancela um ticket aberto e estorna os pontos.

**Autorização:** proprietário do ticket.

### `POST /api/tickets/debito/{id}/aprovar/`

Aprova um ticket aberto.

**Autorização:** administrador do estabelecimento ou superusuário.

O status passa para `APROVADO`.

### `POST /api/tickets/debito/{id}/recusar/`

Recusa um ticket aberto e estorna os pontos.

**Autorização:** administrador do estabelecimento ou superusuário.

### `POST /api/tickets/debito/{id}/concluir/`

Conclui um ticket aprovado.

**Autorização:** cliente proprietário do ticket.

O ticket só pode ser concluído quando estiver com status `APROVADO`.

---

## 9. Stream de tickets

### `GET /api/tickets/stream/?token={access_token}`

Abre um stream Server-Sent Events para acompanhar alterações na fila do estabelecimento.

O token é enviado como parâmetro de consulta porque o `EventSource` utilizado pelo navegador não permite configurar o cabeçalho Authorization diretamente.

#### Eventos

```text
event: tickets_changed
data: {"total": 2}
```

Quando não há alteração, o servidor envia heartbeat:

```text
: heartbeat
```

Sem token ou com token inválido, responde `401` com evento `error`. Um usuário válido sem estabelecimento recebe evento `error` e a conexão termina. O JWT é validado ao abrir a conexão. O primeiro resultado já gera `tickets_changed`, mesmo com total zero; depois os IDs são comparados a cada dois segundos.

O stream considera tickets abertos de crédito e débito do estabelecimento associado ao administrador.

---

## 10. Administração Django

### `GET /admin/`

Acessa o Django Admin quando o usuário possui credenciais administrativas.

A administração é registrada pelo Django e utiliza os modelos ativos do projeto.

---

## 11. Saúde do serviço

### `GET /healthz/`

Rota pública, fora do prefixo `/api/`. Executa `SELECT 1` no banco e retorna `200` com `{"status": "ok"}` ou `503` com `{"status": "unavailable"}` se a consulta falhar.

---

## 12. Métodos e respostas dos tickets

Os viewsets aceitam `GET`, `POST`, `HEAD` e `OPTIONS`; não oferecem `PUT`, `PATCH` ou `DELETE`. As ações de processamento retornam mensagens em `status` (e `pontos_creditados` na aprovação de crédito), não o ticket completo. Consulte o detalhe após a ação quando precisar do objeto atualizado.

As operações de crédito, débito e estorno de saldo utilizam transações atômicas.
