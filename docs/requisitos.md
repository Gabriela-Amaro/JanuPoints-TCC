[Visão Geral](../README.md) | [Diagrama Entidade-Relacionamento](../docs/diagram_er.md) | [Diagrama de Classes](../docs/diagrama_classes.md) | [Fluxo de Requisições](../docs/fluxo_requisicao.md) | [Endpoints](../docs/endpoints.md)

---

# Requisitos do Projeto

Os requisitos a seguir descrevem as funcionalidades e as características técnicas do JanuPoints.

## 1. Requisitos funcionais

### RF1. Autenticação e usuários

- RF1.1. O sistema deve permitir o cadastro público de clientes.
- RF1.2. O sistema deve autenticar clientes e administradores por email e senha.
- RF1.3. O sistema deve emitir access token e refresh token JWT.
- RF1.4. O sistema deve permitir a renovação do access token.
- RF1.5. O sistema deve permitir o logout com blacklist do refresh token.
- RF1.6. O sistema deve retornar os dados do usuário autenticado.
- RF1.7. O sistema deve permitir a alteração da senha do usuário autenticado.

### RF2. Cliente

- RF2.1. O cliente deve visualizar seu nome, email e saldo de pontos.
- RF2.2. O cliente deve consultar estabelecimentos ativos.
- RF2.3. O cliente deve buscar estabelecimentos pelo nome.
- RF2.4. O cliente deve consultar as recompensas disponíveis.
- RF2.5. O cliente deve consultar recompensas por estabelecimento.
- RF2.6. O cliente deve enviar uma nota fiscal para acumular pontos.
- RF2.7. O cliente deve informar valor, número e data da nota.
- RF2.8. O cliente deve anexar a imagem da nota fiscal.
- RF2.9. O cliente deve acompanhar o status do ticket de crédito.
- RF2.10. O cliente deve cancelar um ticket de crédito aberto.
- RF2.11. O cliente deve solicitar o resgate de uma recompensa.
- RF2.12. O cliente deve acompanhar o status do ticket de débito.
- RF2.13. O cliente deve cancelar um ticket de débito aberto.
- RF2.14. O cliente deve concluir um ticket de débito aprovado.
- RF2.15. O cliente deve consultar o histórico de acúmulos e resgates.
- RF2.16. O cliente deve atualizar nome, email e telefone.
- RF2.17. O cliente deve visualizar o CPF cadastrado sem poder alterá-lo.

### RF3. Estabelecimento

- RF3.1. O sistema deve listar estabelecimentos ativos para usuários autenticados.
- RF3.2. O sistema deve permitir a consulta de detalhes de um estabelecimento.
- RF3.3. O administrador deve atualizar os dados do estabelecimento associado.
- RF3.4. O administrador deve atualizar o logotipo do estabelecimento.
- RF3.5. O administrador deve consultar as recompensas do próprio estabelecimento.
- RF3.6. O administrador deve cadastrar uma recompensa.
- RF3.7. O administrador deve editar uma recompensa.
- RF3.8. O administrador deve excluir uma recompensa.
- RF3.9. O administrador deve ativar ou desativar uma recompensa.

### RF4. Tickets de crédito

- RF4.1. O cliente deve criar um ticket com os dados da nota fiscal.
- RF4.2. O sistema deve validar valor positivo, data válida e número não duplicado.
- RF4.3. O ticket deve iniciar com status `ABERTO`.
- RF4.4. O administrador deve consultar tickets do estabelecimento associado.
- RF4.5. O administrador deve aprovar um ticket aberto.
- RF4.6. A aprovação deve creditar os pontos ao cliente.
- RF4.7. O administrador deve recusar um ticket aberto.
- RF4.8. O cliente deve cancelar o próprio ticket enquanto ele estiver aberto.

### RF5. Tickets de débito

- RF5.1. O cliente deve criar um ticket informando uma recompensa.
- RF5.2. O sistema deve validar produto ativo, estabelecimento ativo e saldo suficiente.
- RF5.3. O sistema deve debitar os pontos no momento da criação.
- RF5.4. O ticket deve iniciar com status `ABERTO`.
- RF5.5. O administrador deve aprovar um ticket aberto.
- RF5.6. O administrador deve recusar um ticket aberto.
- RF5.7. A recusa deve devolver os pontos ao cliente.
- RF5.8. O cliente deve cancelar um ticket aberto e receber os pontos de volta.
- RF5.9. O cliente deve concluir um ticket aprovado.

### RF6. Painel web e atualização da fila

- RF6.1. O painel deve exibir a fila de tickets abertos.
- RF6.2. O painel deve exibir contadores de solicitações.
- RF6.3. O painel deve permitir visualizar os detalhes de um ticket.
- RF6.4. O painel deve permitir aprovar ou recusar tickets.
- RF6.5. O painel deve receber eventos SSE quando a fila for alterada.
- RF6.6. O painel deve restringir o acesso a administradores.

## 2. Requisitos não funcionais

### RNF1. Segurança

- A autenticação deve utilizar JWT.
- As senhas devem ser armazenadas usando o mecanismo de hash do Django.
- As rotas protegidas devem exigir autenticação.
- O acesso aos objetos deve respeitar o usuário e o estabelecimento associado.
- O CORS deve ser configurável por ambiente.
- Os tokens devem possuir renovação e blacklist para logout.

### RNF2. Integridade

- Operações que alteram saldo devem utilizar transações atômicas.
- CPF, email, telefone, CNPJ e códigos de tickets devem respeitar as restrições de unicidade configuradas.
- Tickets processados não devem ser aprovados, recusados ou cancelados novamente.

### RNF3. Usabilidade

- O aplicativo deve apresentar mensagens de validação para dados inválidos.
- O aplicativo deve informar estados de carregamento, erro e vazio.
- O painel deve apresentar feedback visual após operações de criação, edição, aprovação e recusa.
- As interfaces devem usar linguagem consistente para acúmulo, resgate, recompensa e status.

### RNF4. Desempenho

- A consulta de tickets do painel deve utilizar o stream SSE para evitar atualizações manuais constantes.
- As consultas de produtos e estabelecimentos devem permitir filtros por busca.
- O backend deve usar consultas relacionadas nos viewsets de produtos e tickets.

### RNF5. Compatibilidade

- O aplicativo deve funcionar nos ambientes suportados pelo Expo.
- O painel deve funcionar em navegadores modernos.
- A API deve aceitar requisições JSON e upload `multipart/form-data` quando necessário.

### RNF6. Manutenibilidade

- O backend deve separar modelos, serializers, views, permissões e URLs por domínio.
- O mobile deve organizar telas, hooks, contextos, serviços e componentes reutilizáveis.
- O painel deve utilizar módulos JavaScript separados por página, serviço e utilitário.
- A documentação deve refletir as rotas e fluxos implementados.
