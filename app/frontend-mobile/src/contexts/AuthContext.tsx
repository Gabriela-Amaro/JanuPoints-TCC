import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as authService from "../services/auth";
import { getAccessToken, clearTokens } from "../services/storage";
import type { UserData, RegisterData } from "../types";

// =============================================================
// Tipagem do contexto
// =============================================================

interface AuthContextData {
  /** Dados do usuário logado (null se não autenticado) */
  user: UserData | null;
  /** True enquanto verifica se há token salvo (splash) */
  isLoading: boolean;
  /** True se há um usuário autenticado */
  isAuthenticated: boolean;
  /** Faz login com email e senha */
  signIn: (email: string, password: string) => Promise<void>;
  /** Cadastra um novo cliente e faz login automático */
  signUp: (data: RegisterData) => Promise<void>;
  /** Faz logout */
  signOut: () => Promise<void>;
  /** Atualiza os dados do usuário autenticado */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// =============================================================
// Provider
// =============================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ao abrir o app, verifica se há token salvo e busca dados do usuário
  useEffect(() => {
    async function loadUser() {
      try {
        const token = await getAccessToken();

        if (token) {
          const userData = await authService.getMe();
          setUser(userData);
        }
      } catch {
        // Token expirado ou inválido — ignora
        await clearTokens();
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  // ----- Ações -----

  async function signIn(email: string, password: string) {
    await authService.login(email, password);
    const userData = await authService.getMe();
    setUser(userData);
  }

  async function signUp(data: RegisterData) {
    // 1. Cadastra o cliente
    await authService.register(data);
    // 2. Faz login automático com as credenciais
    await signIn(data.email, data.password);
  }

  async function signOut() {
    await authService.logout();
    setUser(null);
  }

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (err) {
      console.error("Erro ao atualizar dados do usuário:", err);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =============================================================
// Hook de acesso ao contexto
// =============================================================

/**
 * Hook para acessar os dados de autenticação.
 *
 * Exemplo de uso:
 * ```tsx
 * const { user, signIn, signOut } = useAuth();
 * ```
 */
export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um <AuthProvider>");
  }

  return context;
}
