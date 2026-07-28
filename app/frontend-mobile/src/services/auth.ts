import { api } from "./api";
import { saveTokens, clearTokens, getRefreshToken } from "./storage";
import type { AuthTokens, RegisterData, UserData } from "../types";

// =============================================================
// Funções de autenticação
// =============================================================

/**
 * Faz login e salva os tokens JWT.
 * Endpoint: POST /api/auth/token/
 */
export async function login(email: string, password: string): Promise<AuthTokens> {
  const tokens = await api.post<AuthTokens>("/api/auth/token/", { email, password });
  await saveTokens(tokens.access, tokens.refresh);
  return tokens;
}

/**
 * Cadastra um novo cliente.
 * Endpoint: POST /api/clientes/cadastro/
 */
export async function register(data: RegisterData): Promise<void> {
  await api.post("/api/clientes/cadastro/", data);
}

/**
 * Faz logout (blacklist do refresh token) e limpa os tokens locais.
 * Endpoint: POST /api/auth/logout/
 */
export async function logout(): Promise<void> {
  const refresh = await getRefreshToken();

  if (refresh) {
    try {
      await api.post("/api/auth/logout/", { refresh });
    } catch {
      // Mesmo que o backend falhe, limpamos localmente
    }
  }

  await clearTokens();
}

/**
 * Busca os dados do usuário logado.
 * Endpoint: GET /api/me/
 */
export async function getMe(): Promise<UserData> {
  return api.get<UserData>("/api/me/");
}
