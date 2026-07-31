[Visão Geral](/README.md) | [Diagrama Entidade-Relacionamento](/docs/diagram_er.md) | [Diagrama de Classes](/docs/diagrama_classes.md) | [Requisitos Funcionais e Não Funcionais](/docs/requisitos.md) | [Endpoints](/docs/endpoints.md)

---

# Fluxo de Requisições

## 1. Comunicação entre as aplicações

O aplicativo mobile e o painel web consomem a API Django REST. Durante o desenvolvimento local, a comunicação utiliza HTTP. Em um ambiente publicado, o serviço deve ser colocado atrás de HTTPS.

```mermaid
flowchart TD
    Cliente[Cliente] --> Mobile[Aplicativo mobile]
    Administrador[Administrador] --> Web[Painel web]
    Mobile -->|HTTP + Bearer JWT| API[API Django REST]
    Web -->|HTTP + Bearer JWT| API
    API --> Banco[(PostgreSQL)]
    API --> Media[Media local]
    API -->|SSE| Web
```

### Autenticação comum

1. A aplicação envia email e senha para `/api/auth/token/`.
2. A API retorna `access` e `refresh`.
3. O cliente armazena os tokens.
4. As requisições protegidas enviam `Authorization: Bearer <access>`.
5. Ao receber `401`, o aplicativo mobile tenta renovar o access token com `/api/auth/token/refresh/`.
6. No logout, o refresh token é enviado para `/api/auth/logout/`.

---

## 2. Cadastro e primeiro acesso do cliente

```mermaid
sequenceDiagram
    participant Cliente as Aplicativo mobile
    participant API as API Django
    participant Banco as PostgreSQL

    Cliente->>API: POST /api/clientes/cadastro/
    API->>API: Valida email, CPF, telefone e senhas
    API->>Banco: Cria Usuario e Cliente
    Banco-->>API: Cliente criado
    API-->>Cliente: 201 Created
    Cliente->>API: POST /api/auth/token/
    API->>Banco: Valida credenciais
    Banco-->>API: Usuário autenticado
    API-->>Cliente: access + refresh
    Cliente->>API: GET /api/me/
    API-->>Cliente: Perfil e saldo
    Cliente->>Cliente: Abre /(tabs)/home
```

### Validações

- email único;
- CPF válido e único;
- telefone válido e único;
- senha e confirmação iguais;
- senha submetida às validações do Django.

---

## 3. Consulta de estabelecimentos e recompensas

```mermaid
sequenceDiagram
    participant Cliente as Aplicativo mobile
    participant API as API Django
    participant Banco as PostgreSQL

    Cliente->>API: GET /api/estabelecimentos/
    API->>Banco: Consulta estabelecimentos ativos
    Banco-->>API: Lista de parceiros
    API-->>Cliente: JSON

    Cliente->>API: GET /api/estabelecimentos/{id}/
    API->>Banco: Consulta estabelecimento
    Banco-->>API: Dados do parceiro
    API-->>Cliente: JSON

    Cliente->>API: GET /api/produtos/?estabelecimento={id}
    API->>Banco: Consulta recompensas disponíveis
    Banco-->>API: Produtos ativos
    API-->>Cliente: JSON
```

O painel web utiliza os mesmos recursos para consultar os dados do estabelecimento e carregar o catálogo.

---

## 4. Acúmulo de pontos

O acúmulo começa no aplicativo mobile e termina com a análise do estabelecimento.

```mermaid
sequenceDiagram
    participant Cliente as Aplicativo mobile
    participant API as API Django
    participant Banco as PostgreSQL
    participant Painel as Painel web

    Cliente->>Cliente: Captura imagem da nota fiscal
    Cliente->>API: POST /api/tickets/credito/\n multipart/form-data
    API->>API: Valida nota e estabelecimento
    API->>Banco: Cria TicketCredito ABERTO
    Banco-->>API: Ticket criado
    API-->>Cliente: 201 Created

    Painel->>API: GET /api/tickets/credito/
    API->>Banco: Busca tickets do estabelecimento
    Banco-->>API: Tickets ABERTOS
    API-->>Painel: Lista de solicitações

    Painel->>API: GET /api/tickets/stream/?token=JWT
    API-->>Painel: tickets_changed ou heartbeat

    Painel->>API: POST /api/tickets/credito/{id}/aprovar/
    API->>Banco: Atualiza ticket para CONCLUIDO
    API->>Banco: Credita pontos ao cliente
    Banco-->>API: Transação concluída
    API-->>Painel: Resultado da aprovação

    API-->>Painel: evento tickets_changed
    Cliente->>API: GET /api/tickets/credito/{id}/
    API-->>Cliente: Ticket e pontos calculados
```

### Dados enviados

```text
estabelecimento
imagem
preco
data_nota
numero_nota
```

### Decisão do estabelecimento

- **Aprovar:** o ticket passa para `CONCLUIDO` e os pontos são creditados.
- **Recusar:** o ticket passa para `RECUSADO` e recebe uma observação.
- **Cancelar pelo cliente:** permitido somente enquanto o ticket estiver `ABERTO`.

---

## 5. Resgate de uma recompensa

```mermaid
sequenceDiagram
    participant Cliente as Aplicativo mobile
    participant API as API Django
    participant Banco as PostgreSQL
    participant Painel as Painel web

    Cliente->>API: GET /api/produtos/{id}/
    API->>Banco: Consulta recompensa
    Banco-->>API: Produto e pontos
    API-->>Cliente: Detalhes da recompensa

    Cliente->>API: POST /api/tickets/debito/\n {produto: id}
    API->>Banco: Verifica produto, parceiro e saldo
    API->>Banco: Debita pontos
    API->>Banco: Cria TicketDebito ABERTO
    Banco-->>API: Ticket criado
    API-->>Cliente: 201 Created

    Painel->>API: GET /api/tickets/debito/
    API-->>Painel: Ticket aberto

    Painel->>API: POST /api/tickets/debito/{id}/aprovar/
    API->>Banco: Atualiza ticket para APROVADO
    API-->>Painel: Pedido aprovado

    Cliente->>API: POST /api/tickets/debito/{id}/concluir/
    API->>Banco: Atualiza ticket para CONCLUIDO
    API-->>Cliente: Pedido entregue
```

### Cancelamento e recusa

- O cliente pode cancelar um ticket `ABERTO`; os pontos são estornados.
- O administrador pode recusar um ticket `ABERTO`; os pontos são estornados.
- Um ticket só pode ser concluído quando estiver `APROVADO`.

---

## 6. Atualização da fila por SSE

O painel abre uma conexão com:

```text
GET /api/tickets/stream/?token=<access_token>
```

O backend:

1. valida o access token;
2. localiza o estabelecimento do administrador;
3. consulta os IDs dos tickets de crédito e débito com status `ABERTO`;
4. compara a lista atual com a lista anterior;
5. envia `tickets_changed` quando há alteração;
6. envia heartbeat quando não há alteração;
7. repete a verificação a cada dois segundos.

O painel recebe o evento e recarrega os dados do dashboard.

---

## 7. Atualização do perfil do estabelecimento

```mermaid
sequenceDiagram
    participant Painel as Painel web
    participant API as API Django
    participant Banco as PostgreSQL

    Painel->>API: GET /api/me/
    API-->>Painel: Administrador e estabelecimento associado
    Painel->>API: GET /api/estabelecimentos/{id}/
    API-->>Painel: Dados atuais
    Painel->>Painel: Preenche formulário e preview
    Painel->>API: PATCH /api/estabelecimentos/{id}/
    API->>Banco: Atualiza dados
    Banco-->>API: Estabelecimento atualizado
    API-->>Painel: JSON atualizado
    Painel->>API: PATCH com logotipo, quando necessário
    API-->>Painel: Imagem atualizada
```

Campos editáveis apresentados no painel:

- nome;
- endereço;
- telefone;
- descrição;
- logotipo.

---

## 8. Atualização dos dados do cliente

```mermaid
sequenceDiagram
    participant Cliente as Aplicativo mobile
    participant API as API Django
    participant Banco as PostgreSQL

    Cliente->>API: GET /api/me/
    API-->>Cliente: Dados pessoais
    Cliente->>Cliente: Edita nome, email e telefone
    Cliente->>API: PATCH /api/clientes/{id}/
    API->>Banco: Atualiza Cliente e Usuario
    Banco-->>API: Dados atualizados
    API-->>Cliente: Perfil atualizado
```

O CPF é exibido como somente leitura.

---

## 9. Tratamento de erros

As aplicações apresentam estados de carregamento, erro e vazio. Os principais códigos HTTP utilizados são:

- `200 OK`: consulta ou atualização concluída.
- `201 Created`: recurso criado.
- `204 No Content`: recurso excluído.
- `400 Bad Request`: dados inválidos ou transição de status não permitida.
- `401 Unauthorized`: ausência ou invalidade do token.
- `403 Forbidden`: usuário sem permissão para o recurso.
- `404 Not Found`: recurso inexistente.

O aplicativo mobile interpreta mensagens `error`, `detail` e erros de validação retornados pelos serializers.
