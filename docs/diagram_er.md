[Visão Geral](/README.md) | [Diagrama de Classes](/docs/diagrama_classes.md) | [Requisitos Funcionais e Não Funcionais](/docs/requisitos.md) | [Fluxo de Requisições](/docs/fluxo_requisicao.md) | [Endpoints](/docs/endpoints.md)

---

### Diagrama Entidade-Relacionamento

As entidades abaixo correspondem aos modelos ativos do backend.

```mermaid
erDiagram
    USUARIO {
        int id PK
        string email UK
        string tipo_usuario
        boolean is_active
        boolean is_staff
        datetime created_at
        datetime updated_at
    }

    CLIENTE {
        int usuario_id PK, FK
        string nome
        string cpf UK
        string telefone UK
        int pontos
    }

    ADMINISTRADOR {
        int usuario_id PK, FK
        int estabelecimento_id FK
        string nome
        string cpf UK
        boolean super_user
    }

    ESTABELECIMENTO {
        int id PK
        string nome
        string endereco
        string telefone
        string descricao
        image logotipo
        string cnpj UK
        json horario_funcionamento
        boolean ativo
        datetime created_at
        datetime updated_at
    }

    PRODUTO {
        int id PK
        int estabelecimento_id FK
        string nome
        string descricao
        image imagem
        decimal preco
        int pontos
        boolean ativo
        datetime created_at
        datetime updated_at
    }

    TICKET_CREDITO {
        int id PK
        int cliente_id FK
        int estabelecimento_id FK
        image imagem
        string codigo UK
        string status
        decimal preco
        int pontos
        datetime data_nota
        string numero_nota
        string observacao
        datetime created_at
        datetime updated_at
    }

    TICKET_DEBITO {
        int id PK
        int cliente_id FK
        int produto_id FK
        string codigo UK
        string status
        int pontos
        string observacao
        datetime created_at
        datetime updated_at
    }

    USUARIO ||--o| CLIENTE : possui
    USUARIO ||--o| ADMINISTRADOR : possui
    ESTABELECIMENTO ||--o{ ADMINISTRADOR : vincula
    ESTABELECIMENTO ||--o{ PRODUTO : oferece
    CLIENTE ||--o{ TICKET_CREDITO : envia
    ESTABELECIMENTO o|--o{ TICKET_CREDITO : analisa
    CLIENTE ||--o{ TICKET_DEBITO : solicita
    PRODUTO o|--o{ TICKET_DEBITO : referencia
```

### Regras de relacionamento

- `Usuario` é o modelo de autenticação e pode possuir um perfil `Cliente` ou `Administrador`.
- `Cliente` e `Administrador` usam `usuario_id` como chave primária e relação um-para-um.
- Um `Estabelecimento` possui administradores e recompensas.
- Um cliente pode enviar vários tickets de crédito e criar vários tickets de débito.
- Um ticket de crédito referencia diretamente o estabelecimento escolhido para a nota.
- Um ticket de débito referencia o produto resgatado; o estabelecimento é obtido por meio do produto.
- Tickets de crédito e débito mantêm o código, status, observação e datas de criação/atualização.
