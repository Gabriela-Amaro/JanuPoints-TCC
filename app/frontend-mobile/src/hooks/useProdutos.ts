import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import type { Produto } from "../types";

interface UseProdutosReturn {
  /** Lista de produtos */
  data: Produto[];
  /** True enquanto carrega */
  loading: boolean;
  /** Mensagem de erro, se houver */
  error: string | null;
  /** Refaz a busca */
  refetch: () => void;
}

/**
 * Hook para buscar a lista de produtos da API.
 *
 * Exemplo:
 * ```tsx
 * const { data, loading, error } = useProdutos("salmão");
 * ```
 */
export function useProdutos(search?: string): UseProdutosReturn {
  const [data, setData] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const result = await api.get<Produto[]>(`/api/produtos/${query}`);
      setData(result);
    } catch (err) {
      setError("Não foi possível carregar os produtos.");
      console.error("useProdutos error:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
