[Visão Geral](/README.md) | [Diagrama Entidade-Relacionamento](/docs/diagram_er.md) | [Requisitos Funcionais e Não Funcionais](/docs/requisitos.md) | [Fluxo de Requisições](/docs/fluxo_requisicao.md) | [Endpoints](/docs/endpoints.md)

---

### Diagrama de Classes

O diagrama representa as classes de domínio implementadas nos modelos Django. As ações HTTP, validações de entrada e permissões pertencem às camadas de views, serializers e permissions e não são métodos das entidades.

```mermaid
classDiagram
    direction LR

    class UsuarioManager {
        +create_user(email, password, extra_fields) Usuario
        +create_superuser(email, password, extra_fields) Usuario
    }

    class Usuario {
        +int id
        +string email
        +TipoUsuario tipo_usuario
        +bool is_active
        +bool is_staff
        +bool is_superuser
        +datetime last_login
        +datetime created_at
        +datetime updated_at
        +str()
    }

    class Cliente {
        +int usuario_id
        +string nome
        +string cpf
        +string telefone
        +int pontos
        +str()
    }

    class Administrador {
        +int usuario_id
        +int estabelecimento_id
        +string nome
        +string cpf
        +bool super_user
        +str()
    }

    class Estabelecimento {
        +int id
        +string nome
        +string endereco
        +string telefone
        +string descricao
        +image logotipo
        +string cnpj
        +json horario_funcionamento
        +bool ativo
        +datetime created_at
        +datetime updated_at
        +str()
    }

    class Produto {
        +int id
        +int estabelecimento_id
        +string nome
        +string descricao
        +image imagem
        +decimal preco
        +int pontos
        +bool ativo
        +datetime created_at
        +datetime updated_at
        +save()
        +str()
    }

    class TicketCredito {
        +int id
        +int cliente_id
        +int estabelecimento_id
        +image imagem
        +string codigo
        +string status
        +decimal preco
        +int pontos
        +datetime data_nota
        +string numero_nota
        +string observacao
        +datetime created_at
        +datetime updated_at
        +save()
    }

    class TicketDebito {
        +int id
        +int cliente_id
        +int produto_id
        +string codigo
        +string status
        +int pontos
        +string observacao
        +datetime created_at
        +datetime updated_at
        +save()
    }

    UsuarioManager ..> Usuario : gerencia
    Usuario "1" --> "0..1" Cliente : perfil
    Usuario "1" --> "0..1" Administrador : perfil
    Estabelecimento "1" --> "0..*" Administrador : possui
    Estabelecimento "1" --> "0..*" Produto : oferece
    Cliente "1" --> "0..*" TicketCredito : envia
    Estabelecimento "0..1" --> "0..*" TicketCredito : recebe
    Cliente "1" --> "0..*" TicketDebito : solicita
    Produto "0..1" --> "0..*" TicketDebito : referencia
```

### Relações e responsabilidades

- `Usuario` é o modelo de autenticação e utiliza `email` como identificador.
- `Cliente` e `Administrador` são perfis vinculados a `Usuario` por relações um-para-um.
- `Administrador` pertence a um `Estabelecimento`.
- `Produto` pertence a um estabelecimento e calcula seu valor em pontos no método `save()`.
- `TicketCredito` referencia o cliente e o estabelecimento escolhido para a nota fiscal.
- `TicketDebito` referencia o cliente e o produto resgatado.
- Os métodos de aprovação, recusa, cancelamento e conclusão são ações HTTP implementadas nos viewsets de tickets, não métodos dos modelos.

### Classes auxiliares da aplicação

As classes abaixo participam da API, mas não fazem parte do diagrama de entidades:

- serializers: validam e transformam dados de entrada e saída;
- viewsets: expõem os endpoints REST;
- permissions: controlam o acesso por usuário e estabelecimento;
- `ticket_stream_view`: mantém a fila do painel atualizada por SSE.

Arquivos principais:

- `app/backend/app/usuarios/models/`
- `app/backend/app/estabelecimentos/models.py`
- `app/backend/app/produtos/models.py`
- `app/backend/app/tickets/models/`
- `app/backend/app/tickets/views/`
