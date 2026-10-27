# Execução do JanuPoints

Os comandos abaixo devem ser executados a partir da pasta indicada em cada seção. Os caminhos `cd app/...` partem da raiz do repositório; use terminais separados para backend, painel e mobile.

Pré-requisitos: Docker com Compose para o backend, Node.js/npm para os frontends e Make caso queira usar os atalhos. As dependências Python são instaladas na imagem Docker.

## 1. Variáveis de ambiente

### Backend

Crie o arquivo `.env` em `app/backend` com as variáveis utilizadas pelo Docker Compose e pelo Django.

Em `app/backend`, use `cp .env-example .env` e personalize os valores. Exemplo de configuração:

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

Use valores locais próprios e não versione credenciais reais. Ajuste `UID` e `GID` aos valores de `id -u` e `id -g` no Linux.

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

### Dados de demonstração

Após iniciar os serviços e aplicar as migrações:

```bash
docker compose exec app python manage.py popular_banco
```

Para a carga local, use `DJANGO_ENV=development`. Cria 6 estabelecimentos do ramo alimentício, 24 produtos, 6 gerentes, 6 atendentes, 8 clientes e 1 superusuário. Inclui 73 tickets de crédito e 30 resgates em todos os status, com saldos compatíveis com as regras de pontos. Há produtos pausados, uma sorveteria inativa, uma cliente com poucos pontos e um cliente sem histórico.

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
- `logs`: mostra os logs existentes, sem acompanhamento contínuo; para acompanhar, use `docker compose logs -f app`.
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

A configuração em `januprime/src/js/config/app.js` lê `VITE_API_URL`, com fallback para `http://localhost:8000/api`. Para outra API local, inclua `/api`:

```bash
VITE_API_URL=http://192.168.1.10:8000/api npm run dev
```

O build fica em `app/frontend-web/dist`; defina a variável também ao executar `npm run build` para incorporá-la ao build.

---

## 5. Aplicativo mobile

As versões declaradas no `package.json` são Expo SDK 58, React Native 0.88 e React 19.3.

Entre na pasta do frontend mobile:

```bash
cd app/frontend-mobile
```

Instale as dependências:

```bash
npm ci
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

O serviço `src/services/api.ts` lê `EXPO_PUBLIC_API_URL` **sem `/api`**. Sem ela, tenta o IP de `hostUri` do Expo na porta `8000`; se indisponível, usa `10.0.2.2` no Android ou `localhost` nas demais plataformas.

Para definir a API explicitamente:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.10:8000 npx expo start --clear
```

No celular físico, use a mesma rede do computador e permita acesso à porta `8000` no firewall. `localhost` no celular aponta para o próprio celular. A detecção automática pode não funcionar com túnel Expo; nesse caso, informe um endereço alcançável pelo dispositivo.

`npm run android` e `npm run ios` compilam a aplicação nativa e exigem o ambiente Android/iOS correspondente. Use um Expo Go compatível com SDK 58 ou gere um development build/APK. APKs compilados com SDK 54 precisam ser recompilados: atualizar o JavaScript não atualiza os módulos nativos.

Para reiniciar o Expo limpando o cache:

```bash
npx expo start --clear
```

### Captura de notas fiscais

A captura usa `expo-image-picker`. O serviço `src/services/notaFiscalCapture.ts` mantém a foto entre telas e prepara o upload com `expo-file-system` no nativo. Se a sessão de captura for perdida, tire a foto novamente. Valor, número e data da nota são informados manualmente.

### Ícones e splash

Os ícones e a splash usam a identidade JanuPoints (J creme com ponto dourado). Os arquivos nativos em `app/frontend-mobile/assets/images` são quadrados, com 1024×1024 pixels; o ícone adaptativo inclui margem para as máscaras do Android. A origem está em [janupoints-opcao-a-original.png](../../docs/identidade/janupoints-opcao-a-original.png). Recompile o aplicativo para atualizar os recursos nativos instalados.

Para conectar o aplicativo à API publicada e gerar o APK, consulte o [guia de hospedagem](../../docs/hospedagem.md#7-conectar-o-mobile-e-gerar-o-apk).

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
npm run typecheck
npm audit
npx expo install --check
npx expo-doctor
```

O override de `zod` é restrito ao `@expo/cli` e utiliza a faixa `^4.6.7`, conforme o `package.json`. Preserve as versões compatíveis com o SDK ao atualizar as dependências.

### Backend

Com os serviços do Compose em execução:

```bash
cd app/backend
docker compose exec app python manage.py check
docker compose exec app python manage.py test
```

O container recebe as variáveis do `.env` e resolve o host `db`. Executar diretamente no host exige configurar dependências, variáveis e acesso ao banco.

---

## 7. Endereços principais

| Serviço | Endereço |
|---|---|
| Saúde da API e banco | `http://localhost:8000/healthz/` |
| API Django | `http://localhost:8000/api/` |
| Django Admin | `http://localhost:8000/admin/` |
| Painel web | `http://localhost:3000` |
| PostgreSQL local | `localhost:5432` |

## Publicação de demonstração

Para hospedar painel, API e banco no Render Free e imagens no Supabase Storage,
siga o [guia de hospedagem](../../docs/hospedagem.md). O desenvolvimento local
continua usando Docker Compose; não precisa de contas nesses serviços.
