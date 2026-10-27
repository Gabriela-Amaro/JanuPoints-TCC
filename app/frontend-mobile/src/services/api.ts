import Constants from "expo-constants";
import { Platform } from "react-native";
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "./storage";

// =============================================================
// Configuração da URL base da API
// =============================================================
// Em produção, a URL da API vem de EXPO_PUBLIC_API_URL (definida no build).
// Em desenvolvimento, detecta automaticamente o IP do servidor Expo.
// O hostUri do Expo tem o formato "192.168.x.x:8081" — extraímos o IP.

function getBaseUrl(): string {
  // URL de produção configurada no momento do build (ex.: https://api.seudominio.com)
  const productionUrl = process.env.EXPO_PUBLIC_API_URL;

  if (productionUrl) {
    return productionUrl.replace(/\/$/, "");
  }

  // Tenta usar o IP do servidor Expo (funciona em qualquer dispositivo)
  const hostUri = Constants.expoConfig?.hostUri;

  if (hostUri) {
    const ip = hostUri.split(":")[0]; // "192.168.x.x:8081" → "192.168.x.x"
    return `http://${ip}:8000`;
  }

  // Fallback para emuladores/simuladores
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }

  return "http://localhost:8000";
}

const BASE_URL = getBaseUrl();

// Log da URL para facilitar debug
console.log("[API] BASE_URL:", BASE_URL);

// =============================================================
// Cliente HTTP com injeção automática de JWT
// =============================================================

/** Flag para evitar loops infinitos de refresh */
let isRefreshing = false;

/**
 * Faz uma requisição HTTP à API com autenticação JWT automática.
 *
 * - Injeta o access token no header Authorization
 * - Se receber 401, tenta refresh do token e repete a requisição
 * - Lança erro com a mensagem da API para facilitar tratamento no UI
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = await getAccessToken();

  // Monta os headers com o token (se existir)
  const headers: Record<string, string> = {
    ...(!(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // Faz a requisição
  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Se 401 e temos refresh token, tenta renovar
  if (response.status === 401 && !isRefreshing) {
    isRefreshing = true;

    const refreshToken = await getRefreshToken();

    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${BASE_URL}/api/auth/token/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          await saveTokens(data.access, data.refresh ?? refreshToken);

          // Repete a requisição original com o novo token
          headers["Authorization"] = `Bearer ${data.access}`;
          response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
        } else {
          // Refresh falhou — limpa tokens (usuário precisa logar de novo)
          await clearTokens();
        }
      } catch {
        await clearTokens();
      }
    }

    isRefreshing = false;
  }

  // Trata resposta
  if (!response.ok) {
    const rawText = await response.text().catch(() => "");
    console.warn(`[API] Erro ${response.status} em ${endpoint}:`, rawText);

    let errorData: Record<string, unknown> = {};
    try {
      errorData = JSON.parse(rawText);
    } catch {
      // Resposta não é JSON — inclui o texto cru no erro
      if (rawText) {
        errorData = { detail: rawText };
      }
    }

    throw new ApiError(response.status, errorData);
  }

  // 204 No Content — retorna vazio
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// =============================================================
// Classe de erro customizada para erros da API
// =============================================================

export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;

  constructor(status: number, data: Record<string, unknown>) {
    super(`Erro na API: ${status}`);
    this.status = status;
    this.data = data;
  }
}

// =============================================================
// Funções auxiliares de conveniência
// =============================================================

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),

  del: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};

// =============================================================
// Tradução e Formatação Global de Erros de API
// =============================================================

const ERROR_TRANSLATIONS: Record<string, string> = {
  "the phone number entered is not valid": "O número de telefone informado não é válido.",
  "enter a valid phone number": "O número de telefone informado não é válido.",
  "invalid phone number": "O número de telefone informado não é válido.",
  "phone number": "O número de telefone informado não é válido.",
  "this field is required": "Este campo é de preenchimento obrigatório.",
  "enter a valid email address": "Por favor, informe um endereço de e-mail válido.",
  "this field must be unique": "Este valor já está em uso por outro cadastro.",
  "user with this email already exists": "Este e-mail já está cadastrado em outra conta.",
  "cliente com este cpf já existe": "Este CPF já está cadastrado em outra conta.",
  "invalid password": "A senha informada está incorreta.",
  "user account is disabled": "Esta conta de usuário está desativada.",
  "unable to log in with provided credentials": "E-mail ou senha incorretos.",
  "this password is too short": "Esta senha é muito curta. Ela precisa conter pelo menos 8 caracteres.",
  "this password is too common": "Esta senha é muito comum. Escolha uma senha mais segura.",
  "this password is entirely numeric": "A senha não pode conter apenas números.",
};

function extractAllMessages(data: unknown): string[] {
  if (typeof data === "string") return [data];
  if (Array.isArray(data)) return data.flatMap(extractAllMessages);
  if (typeof data === "object" && data !== null) {
    return Object.values(data).flatMap(extractAllMessages);
  }
  return [];
}

function translateSingleMessage(raw: string): string {
  const clean = raw.trim();
  const lower = clean.toLowerCase();

  for (const [englishPattern, portugueseText] of Object.entries(ERROR_TRANSLATIONS)) {
    if (lower.includes(englishPattern.toLowerCase())) {
      return portugueseText;
    }
  }

  return clean;
}

export function formatErrorMessage(
  err: unknown,
  fallback: string = "Ocorreu um erro. Tente novamente."
): string {
  if (err instanceof ApiError && err.data) {
    const messages = extractAllMessages(err.data);

    if (messages.length > 0) {
      const translated = translateSingleMessage(messages[0]);
      if (translated) {
        return translated;
      }
    }
  }

  return fallback;
}

export { BASE_URL };
