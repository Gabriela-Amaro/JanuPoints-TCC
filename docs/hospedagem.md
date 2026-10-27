# Deploy gratuito de demonstração — Render e Supabase

Esta configuração é para testes do TCC com dados fictícios. Ela publica:

- painel Vite como Static Site gratuito no Render;
- API Django e Django Admin em Web Service Free no Render;
- PostgreSQL Free no Render;
- fotos e comprovantes em um bucket privado do Supabase Storage Free.

O arquivo `render.yaml`, na raiz do repositório, é o Blueprint que cria os três
recursos do Render. Não é necessário servidor AWS, Terraform, Ansible, domínio
próprio, Nginx ou Docker na máquina de quem publica. O Docker Compose continua
sendo a opção de desenvolvimento local.

## 1. Limites e duração

Confira os planos antes de confirmar a criação. API e banco estão declarados
como `free`; o painel estático também é gratuito. Não adicione disco persistente
ou altere os recursos para planos pagos. O uso deve permanecer nas cotas.

O Render Free pode suspender a API após 15 minutos sem tráfego; o primeiro acesso
pode levar cerca de um minuto. O PostgreSQL Free expira após 30 dias. Para outra
rodada de testes, crie um novo banco gratuito e reconecte a API; os dados de
exemplo serão recriados. O Supabase Free também pode pausar por inatividade.
URLs de imagem assinadas valem uma hora; recarregue a tela para obter novas URLs.

Referências: [Render Free](https://render.com/docs/free),
[Supabase Free](https://supabase.com/pricing).

## 2. Preparar o repositório

1. Faça um fork para sua conta no GitHub, ou publique estas alterações no seu
   próprio repositório. O Render lê o GitHub, não os arquivos locais sem commit.
2. Confirme que `render.yaml`, `app/backend/app/core/seed_assets/` e os scripts
   de deploy estão no repositório. Nunca envie `.env` ou chaves do Supabase.
3. Cada pessoa deve usar suas próprias contas Render e Supabase. Para executar
   apenas localmente, use [o guia de execução](../app/execucao/exec.md).

## 3. Criar o armazenamento no Supabase

1. Crie uma conta e um projeto no plano **Free** em https://supabase.com.
2. Em **Storage**, crie um bucket chamado **`janupoints-media`**.
3. Mantenha o bucket **privado**. Não habilite acesso público nem políticas de
   upload anônimo. A API usa credenciais S3 no servidor e fornece URLs assinadas.
4. Nas configurações de Storage/S3, gere um par de credenciais S3 e copie:
   **Endpoint**, **Region**, **Access Key ID** e **Secret Access Key**.
   Use os valores fornecidos pelo projeto; não são as chaves `anon`, `publishable`
   ou `service_role` da API Supabase.
5. O endpoint tem formato semelhante a
   `https://SEU-PROJETO.storage.supabase.co/storage/v1/s3`.

O bucket não é criado pelo Blueprint. As credenciais S3 devem ficar apenas no
serviço da API, nunca no painel web ou no aplicativo.
[Autenticação S3 do Supabase](https://supabase.com/docs/guides/storage/s3/authentication).

## 4. Criar o Blueprint no Render

1. Acesse https://dashboard.render.com e conecte sua conta GitHub.
2. Selecione **New → Blueprint** e escolha o fork/repositório com estas alterações.
3. Se o arquivo estiver na raiz do repositório, mantenha `render.yaml`. Se o seu
   repositório contiver uma pasta externa `JanuPoints-TCC`, selecione essa pasta
   como raiz do projeto ou ajuste os caminhos do Blueprint para incluir o prefixo
   (inclusive `rootDir` dos dois serviços).
4. Confira os recursos: `janupoints-api` Free, `janupoints-web` Static Site e
   `janupoints-db` Free, sem recursos pagos extras. Só pode haver um banco Free
   ativo por workspace; remova um banco de teste anterior se necessário.
5. Preencha as variáveis solicitadas da API:

   - `DEMO_PASSWORD`: uma senha de teste escolhida por você, com pelo menos
     12 caracteres. Ela será a senha inicial de todas as contas novas do seed,
     inclusive o superusuário. Não precisa usar a senha pública do ambiente local.
   - `SUPABASE_S3_ENDPOINT_URL`: endpoint S3 copiado do Supabase.
   - `SUPABASE_S3_REGION`: região copiada do Supabase.
   - `SUPABASE_S3_ACCESS_KEY_ID`: Access Key ID S3.
   - `SUPABASE_S3_SECRET_ACCESS_KEY`: Secret Access Key S3.
   - `CORS_ALLOWED_ORIGINS`: URL HTTPS do painel. Caso ainda não saiba o endereço,
     informe temporariamente `https://example.invalid` e ajuste no passo 5 abaixo.
   - `CSRF_TRUSTED_ORIGINS`: o mesmo endereço do painel, também podendo usar
     `https://example.invalid` temporariamente.

6. Crie o Blueprint e acompanhe os logs. O Render gera `SECRET_KEY` e injeta
   `DATABASE_URL`; não é necessário preencher senhas do PostgreSQL manualmente.
7. O painel recebe automaticamente o hostname público da API e compila com
   `https://HOST-DA-API/api`. Não edite os endereços no código-fonte.

Os nomes públicos podem ganhar sufixos no Render. Use as URLs realmente exibidas,
não presuma que serão exatamente os exemplos abaixo.
[Blueprints](https://render.com/docs/infrastructure-as-code).

## 5. Autorizar o endereço real do painel

1. Abra o serviço `janupoints-web` e copie sua URL HTTPS, sem barra final.
2. Em `janupoints-api` → **Environment**, defina `CORS_ALLOWED_ORIGINS` e
   `CSRF_TRUSTED_ORIGINS` com essa URL. Exemplo: `https://janupoints-web-abc.onrender.com`.
3. Salve e faça o redeploy/restart oferecido pelo Render.
4. Para autorizar também o painel local, use valores separados por vírgula,
   por exemplo `https://janupoints-web-abc.onrender.com,http://localhost:3000`.

O Django aceita automaticamente o hostname da própria API. O Admin usa a mesma
origem da API e não precisa de domínio separado.

## 6. Primeiro acesso e dados de teste

Na inicialização, a API executa automaticamente:

```text
python manage.py migrate --noinput
python manage.py popular_banco --sem-relatorio
Gunicorn com workers em threads
```

A carga só é habilitada porque o Blueprint define `ALLOW_DEMO_DATA=true`. Ela
funciona com `DJANGO_ENV=production` e `DEBUG=False`. Não é necessário terminal
remoto, que não está disponível no Render Free, nem executar `createsuperuser`.
A carga copia as fotos e gera as notas fictícias diretamente no storage configurado.

Endereços (substitua pelos seus):

- Saúde da API: `https://SUA-API.onrender.com/healthz/` → `{"status":"ok"}`.
- Django Admin: `https://SUA-API.onrender.com/admin/`.
- Painel do estabelecimento: URL do `janupoints-web`.

Django Admin e painel:

- Email: **`plataforma@demo.janupoints.test`**.
- Senha inicial: **o valor de `DEMO_PASSWORD` informado no Render**.

Para o app mobile, um cliente de teste é `maria@demo.janupoints.test`, com a mesma
senha inicial. Os demais emails estão em [acessos de teste](acessos_teste.md).
A senha `Janu@2026` documentada ali continua sendo o padrão **local**; no deploy,
vale `DEMO_PASSWORD` para contas recém-criadas.

Reiniciar a API não duplica tickets, não reaplica pontos e não redefine senhas.
O catálogo demonstrativo é reaplicado: não conte com edições manuais de nomes,
preços ou disponibilidade após reiniciar. Alterar `DEMO_PASSWORD` não redefine
senhas das contas existentes. O relatório local de senhas não é gravado no deploy.
O banco pode conter registros extras se já tiver sido usado em outros testes.

Teste login, imagens, envio de nota fiscal, aprovação, resgate e atualização da
fila. O SSE atual é síncrono; o servidor usa threads para atendê-lo sem bloquear
as demais requisições. Esta configuração usa uma única instância pequena para
uma demonstração com poucos acessos simultâneos.

## 7. Conectar o mobile e gerar o APK

Para testar com Expo na sua máquina:

```bash
cd app/frontend-mobile
npm ci
EXPO_PUBLIC_API_URL=https://SUA-API.onrender.com npx expo start --clear
```

A URL do mobile **não leva `/api` no final**. Já a variável `VITE_API_URL` do
painel leva `/api` (o build do Blueprint monta esse valor automaticamente).

Para um APK, configure sua conta Expo/EAS uma vez:

```bash
npx eas-cli login
npx eas-cli init
```

O `init` deve vincular o projeto à sua conta e gravar `extra.eas.projectId` em
`app.json`. Commit esse identificador antes de usar GitHub Actions. No projeto
Expo, crie a variável `EXPO_PUBLIC_API_URL` com a URL da sua API no ambiente
**preview**, como texto não secreto, e execute:

```bash
npx eas-cli build --platform android --profile preview
```

Use a cota gratuita disponível do EAS ou faça build local com Android SDK/JDK;
confira os limites em https://expo.dev/pricing antes de iniciar um build remoto.
Depois baixe o APK e distribua-o diretamente ou anexe-o a uma Release do GitHub.

O workflow `.github/workflows/build-apk.yml` pode gerar o APK ao enviar uma tag
`v*`. Configure `EXPO_TOKEN` nos secrets do GitHub e vincule previamente o projeto
EAS. Gerar APK é separado de hospedar API/painel. O workflow não cria contas Expo.

## 8. Atualizações, reinícios e expiração

- Faça push das alterações no repositório conectado. O Render recompila os
  serviços conforme sua configuração de deploy automático.
- O disco da API é descartável; imagens persistem no Supabase e dados no Postgres.
- Deixe `ALLOW_DEMO_DATA=true` durante os testes: ele restaura arquivos de exemplo
  que faltarem sem duplicar os movimentos. Não há download de imagens externas.
- Após 30 dias, o Postgres Free expira. Remova o banco expirado e crie outro Free
  na mesma região. Atualize `DATABASE_URL` da API com a nova Internal Database URL
  e reinicie. Ao usar outro nome no Blueprint, ajuste também o `fromDatabase`.
  Não recrie um Blueprint completo só para renovar o banco: isso pode duplicar
  serviços. Os uploads antigos continuam no bucket até serem apagados por você.
- Ao encerrar o TCC, remova os recursos no painel Render e o projeto/bucket de
  teste no Supabase. Apagar arquivos do Git não apaga recursos já provisionados.

## 9. Diagnóstico

- **Erro CORS no login:** ajuste a URL exata do painel na API (HTTPS, sem barra).
- **API 503 / health falha:** confira `DATABASE_URL` e se o banco não expirou.
- **API demora para abrir:** aguarde a retomada do Free após inatividade.
- **Erro S3 403:** confira credenciais S3, endpoint, região e existência do bucket.
- **Imagens expiram:** recarregue a página; as URLs são assinadas por uma hora.
- **Seed bloqueado:** confira `ALLOW_DEMO_DATA=true` e senha de pelo menos 12 caracteres.
- **Admin sem CSS:** confirme que `collectstatic` passou no build.
- **Senha não muda ao alterar variável:** o seed preserva as senhas existentes.
  Use a alteração de senha no Admin enquanto tiver acesso à conta.
