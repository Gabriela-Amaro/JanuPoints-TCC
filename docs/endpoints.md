[Visão Geral](/README.md) | [Diagrama Entidade-Relacionamento](/docs/diagram_er.md) | [Diagrama de Classes](/docs/diagrama_classes.md) | [Requisitos Funcionais e Não Funcionais](/docs/requisitos.md) | [Fluxo de Requisições](/docs/fluxo_requisicao.md)

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

Gera um novo access token usando o refresh token.

**Autorização:** pública, com refresh token válido.

#### Corpo

```json
{
  "refresh": "<refresh_token>"
}
```

### `POST /api/auth/logout/`

Adiciona o refresh token à blacklist.

**Autorização:** token JWT e refresh token válido.

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
  "telefone": "5538999998888",
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

### `PUT /api/usuarios/change-password/`

Altera a senha do usuário autenticado.

**Autorização:** usuário autenticado.

O corpo é validado por `ChangePasswordSerializer` e deve conter os campos de senha definidos pelo backend, incluindo a senha atual e a nova senha.

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

Retorna os dados do cliente criado, com `cpf` e `pontos` como campos somente leitura.

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

#### Resposta

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
  "created_at": "2026-01-01T12:00:00Z",
  "updated_at": "2026-01-01T12:00:00Z"
}
```

### `PUT /api/estabelecimentos/{id}/`

Atualiza um estabelecimento.

**Autorização:** superusuário ou administrador autorizado do estabelecimento.

### `PATCH /api/estabelecimentos/{id}/`

Atualiza parcialmente um estabelecimento.

**Autorização:** superusuário ou administrador autorizado do estabelecimento.

### `DELETE /api/estabelecimentos/{id}/`

Exclui um estabelecimento.

**Autorização:** superusuário ou administrador autorizado do estabelecimento.

O cadastro de novos estabelecimentos não é exposto por este viewset.

---

## 6. Produtos e recompensas

### `GET /api/produtos/`

Lista produtos conforme o perfil autenticado.

**Autorização:** usuário autenticado.

Comportamento:

- superusuário: todos os produtos;
- administrador: produtos do estabelecimento associado;
- cliente: produtos ativos de estabelecimentos ativos.

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

**Autorização:** superusuário ou administrador autorizado.

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

**Autorização:** superusuário ou administrador autorizado.

### `PATCH /api/produtos/{id}/`

Atualiza parcialmente uma recompensa.

**Autorização:** superusuário ou administrador autorizado.

### `DELETE /api/produtos/{id}/`

Exclui uma recompensa.

**Autorização:** superusuário ou administrador autorizado.

### Cálculo de pontos

Ao salvar um produto, o backend calcula:

```text
pontos = int(preco * 100 / PORCENTAGEM_CASHBACK)
```

O valor padrão de `PORCENTAGEM_CASHBACK` é `5.0`.

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
data_nota: data da nota
numero_nota: número da nota
```

Validações:

- `preco` deve ser maior que zero;
- `data_nota` não pode estar no futuro;
- a combinação de estabelecimento e número da nota não pode estar duplicada;
- o estabelecimento precisa estar ativo.

O ticket é criado com status `ABERTO` e os pontos são calculados com `PONTOS_POR_REAL_GASTO`.

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

Na criação, os pontos do produto são debitados do cliente e o ticket é criado com status `ABERTO`.

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

O stream considera tickets abertos de crédito e débito do estabelecimento associado ao administrador.

---

## 10. Administração Django

### `GET /admin/`

Acessa o Django Admin quando o usuário possui credenciais administrativas.

A administração é registrada pelo Django e utiliza os modelos ativos do projeto.
