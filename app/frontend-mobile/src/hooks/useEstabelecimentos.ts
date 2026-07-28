import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import type { Estabelecimento } from "../types";

interface UseEstabelecimentosReturn {
  /** Lista de estabelecimentos */
  data: Estabelecimento[];
  /** True enquanto carrega */
  loading: boolean;
  /** Mensagem de erro, se houver */
  error: string | null;
  /** Refaz a busca */
  refetch: () => void;
}

/**
 * Hook para buscar a lista de estabelecimentos da API.
 *
 * Exemplo:
 * ```tsx
 * const { data, loading, error } = useEstabelecimentos();
 * ```
 */
export function useEstabelecimentos(search?: string): UseEstabelecimentosReturn {
  const [data, setData] = useState<Estabelecimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const result = await api.get<Estabelecimento[]>(`/api/estabelecimentos/${query}`);
      setData(result);
    } catch (err) {
      setError("Não foi possível carregar os estabelecimentos.");
      console.error("useEstabelecimentos error:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
