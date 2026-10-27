# Aplicativo mobile

O aplicativo usa Expo SDK 58, React Native 0.88 e React 19.3.

```bash
npm ci
npm run typecheck
npx expo start --clear
```

Use um Expo Go compatível com SDK 58 ou gere um novo development build/APK.
APKs compilados com SDK 54 precisam ser recompilados; atualizar o JavaScript
não atualiza os módulos nativos.

Para verificar as dependências:

```bash
npm audit
npx expo install --check
npx expo-doctor
```

O override de `zod` é restrito ao `@expo/cli`: a CLI 58.1.15 ainda declara
Zod 3, afetado pelo GHSA-mrhx-c7xc-m3w5. Usamos Zod 4.6.7, com os schemas
usados pela CLI verificados durante a atualização. Reavaliar esse override
quando o Expo corrigir sua dependência. Não execute `npm audit fix --force`:
na atualização ele propôs retornar ao Expo SDK 54.

Os ícones e a splash usam a identidade JanuPoints (J creme com ponto dourado).
Os arquivos nativos são quadrados, com 1024×1024 pixels; o ícone adaptativo
inclui margem para as máscaras do Android. A origem está em
`../../docs/identidade/janupoints-opcao-a-original.png`.

Para conectar o app à API publicada e gerar o APK, siga o [guia de hospedagem](../../docs/hospedagem.md#7-conectar-o-mobile-e-gerar-o-apk).
