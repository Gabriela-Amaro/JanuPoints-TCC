import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import type { TicketCredito, TicketDebito, Transacao } from "../types";

interface UseTransacoesReturn {
  data: Transacao[];
  emAndamento: Transacao[];
  finalizados: Transacao[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook que busca tickets de crédito e débito e os unifica em uma lista de transações,
 * separando entre "Em Andamento" e "Finalizados".
 */
export function useTransacoes(): UseTransacoesReturn {
  const [data, setData] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [creditos, debitos] = await Promise.all([
        api.get<TicketCredito[]>("/api/tickets/credito/"),
        api.get<TicketDebito[]>("/api/tickets/debito/"),
      ]);

      const transacoes: Transacao[] = [
        ...creditos.map((t) => ({ ...t, tipo: "credito" as const })),
        ...debitos.map((t) => ({ ...t, tipo: "debito" as const })),
      ];

      // Ordena por data mais recente primeiro
      transacoes.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setData(transacoes);
    } catch (err) {
      setError("Não foi possível carregar as transações.");
      console.error("useTransacoes error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // "Em andamento" = ABERTO ou APROVADO
  const emAndamento = data.filter(
    (t) => t.status === "ABERTO" || t.status === "APROVADO"
  );

  // "Finalizado" = CONCLUIDO, CANCELADO, RECUSADO
  const finalizados = data.filter(
    (t) =>
      t.status === "CONCLUIDO" ||
      t.status === "CANCELADO" ||
      t.status === "RECUSADO"
  );

  return { data, emAndamento, finalizados, loading, error, refetch: fetchData };
}
