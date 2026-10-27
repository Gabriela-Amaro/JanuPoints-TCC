# Execução do JanuPoints

Os comandos abaixo devem ser executados a partir da pasta indicada em cada seção.

## 1. Variáveis de ambiente

### Backend

Crie o arquivo `.env` em `app/backend` com as variáveis utilizadas pelo Docker Compose e pelo Django.

Exemplo de configuração:

```env
UID=1000
GID=1000
POSTGRES_DB=janupoints
POSTGRES_USER=janupoints
POSTGRES_PASSWORD=senha_local
SECRET_KEY=chave-local
DJANGO_ENV=development
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Use valores próprios para cada ambiente e não versionar credenciais reais.

O banco utilizado pelo Compose é PostgreSQL e o serviço Django acessa o banco pelo host `db`.

---

## 2. Backend com Docker

Entre na pasta do backend:

```bash
cd app/backend
```

Construa a imagem:

```bash
docker compose build
```

Inicie o banco e a API:

```bash
docker compose up -d
```

A aplicação Django será disponibilizada em:

```text
http://localhost:8000
```

A API utiliza o prefixo:

```text
http://localhost:8000/api/
```

### Migrações

```bash
docker compose exec app python manage.py migrate
```

A carga só executa com `DJANGO_ENV=development`. Cria 6 estabelecimentos do ramo alimentício, 24 produtos, 6 gerentes, 6 atendentes, 8 clientes e 1 superusuário. Inclui 73 tickets de crédito e 30 resgates em todos os status, com saldos compatíveis com as regras de pontos. Há produtos pausados, uma sorveteria inativa, uma cliente com poucos pontos e um cliente sem histórico.

As imagens ilustrativas dos estabelecimentos estão versionadas em `core/seed_assets` e as 24 fotos individuais dos produtos em `core/seed_assets/produtos`. O comando copia as imagens para `media` automaticamente. Os comprovantes fictícios são gerados localmente, com número, data, CNPJ e valor correspondentes ao ticket; não há downloads externos.

A senha inicial das contas novas é `Janu@2026`. Todos os logins de demonstração estão em [Acessos de teste](../../docs/acessos_teste.md). O relatório de **todos os usuários do banco** é gerado em `app/backend/app/ACESSOS_TESTE.local.md` (no container, `/app/ACESSOS_TESTE.local.md`), ignorado pelo Git. Senhas preexistentes são preservadas; quando não correspondem à senha de teste, o relatório indica que não podem ser recuperadas.

Para escolher outro destino dentro do container:

```bash
docker compose exec app python manage.py popular_banco --arquivo-logins /app/acessos-local.md
```

Repetir o comando atualiza o catálogo demonstrativo, mas preserva as senhas, os status e as datas dos tickets existentes, sem duplicar registros ou aplicar pontos novamente. A farmácia e a livraria do seed antigo são convertidas em hamburgueria e pizzaria, com atualização dos produtos de demonstração e preservação de IDs, funcionários e tickets. Outros registros não são removidos.

Para aplicar migrações e popular com um único comando, use `make seed`.

### Criar superusuário

```bash
docker compose exec app python manage.py createsuperuser
```

### Criar migrações

```bash
docker compose exec app python manage.py makemigrations
```

### Executar testes

```bash
docker compose exec app python manage.py test
```

### Recalcular pontos das recompensas

```bash
docker compose exec app python manage.py recalcular_pontos_produtos
```

### Acessar o shell do container

```bash
docker compose exec app bash
```

### Ver logs

```bash
docker compose logs -f app
```

### Parar os serviços

```bash
docker compose down
```

Os dados do PostgreSQL permanecem no volume `postgres_data` enquanto o volume não for removido.

---

## 3. Comandos pelo Makefile

A partir de `app/backend`:

```bash
make migration
make migrate
make seed
make superuser
make bash
make fmt
make logs
make test
make build
make flushtokens
```

Correspondências principais:

- `migration`: cria migrações.
- `migrate`: aplica migrações.
- `seed`: aplica migrações e preenche o banco com os dados de teste.
- `superuser`: cria usuário administrativo.
- `bash`: abre o shell do container.
- `fmt`: executa o Black.
- `logs`: mostra logs do serviço.
- `test`: executa a suíte Django.
- `build`: reconstrói a imagem do app sem cache.
- `flushtokens`: remove tokens expirados.

---

## 4. Painel web

Entre na pasta do frontend web:

```bash
cd app/frontend-web
```

Instale as dependências:

```bash
npm install
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

O Vite utiliza a pasta `januprime` como raiz e inicia o painel na porta `3000`.

```text
http://localhost:3000
```

### Build de produção

```bash
npm run build
```

### Preview do build

```bash
npm run preview
```

### Makefile do frontend web

```bash
make install
make run
make build
make preview
```

A URL da API é configurada em:

```text
app/frontend-web/januprime/src/js/config/app.js
```

---

## 5. Aplicativo mobile

Entre na pasta do frontend mobile:

```bash
cd app/frontend-mobile
```

Instale as dependências:

```bash
npm install
```

Inicie o Expo:

```bash
npm run start
```

Comandos disponíveis:

```bash
npm run android
npm run ios
npm run web
```

O aplicativo utiliza Expo Router e inicia pela entrada configurada em `package.json`:

```json
{
  "main": "expo-router/entry"
}
```

Para executar em um dispositivo físico, configure a URL da API em:

```text
app/frontend-mobile/src/services/api.ts
```

---

## 6. Verificações locais

### Frontend web

```bash
cd app/frontend-web
npm run build
```

### Frontend mobile

```bash
cd app/frontend-mobile
npx tsc --noEmit
```

### Backend

Com as dependências disponíveis no ambiente ou dentro do container:

```bash
cd app/backend/app
python manage.py check
python manage.py test
```

---

## 7. Endereços principais

| Serviço | Endereço |
|---|---|
| API Django | `http://localhost:8000/api/` |
| Django Admin | `http://localhost:8000/admin/` |
| Painel web | `http://localhost:3000` |
| PostgreSQL local | `localhost:5432` |

## Publicação de demonstração

Para hospedar painel, API e banco no Render Free e imagens no Supabase Storage,
siga o [guia de hospedagem](../../docs/hospedagem.md). O desenvolvimento local
continua usando Docker Compose; não precisa de contas nesses serviços.
