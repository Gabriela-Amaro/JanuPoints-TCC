import { useCallback, useEffect, useState } from "react";
import { api, BASE_URL } from "../services/api";
import type { Anuncio } from "../types";

interface UseAnunciosReturn {
  /** URLs completas das imagens dos anúncios */
  imageUrls: string[];
  /** True enquanto carrega */
  loading: boolean;
  /** Mensagem de erro, se houver */
  error: string | null;
  /** Refaz a busca */
  refetch: () => void;
}

/**
 * Hook para buscar anúncios da API e extrair as URLs de imagens.
 * Já monta a URL completa (BASE_URL + path da imagem).
 *
 * Exemplo:
 * ```tsx
 * const { imageUrls } = useAnuncios();
 * // Passar imageUrls para o <CarrosselImagens data={imageUrls} />
 * ```
 */
export function useAnuncios(): UseAnunciosReturn {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const anuncios = await api.get<Anuncio[]>("/api/anuncios/");

      // Extrai as URLs das imagens, montando URL completa quando necessário
      const urls = anuncios
        .filter((a) => a.imagem) // ignora anúncios sem imagem
        .map((a) => {
          const img = a.imagem!;
          // Se já for URL completa (http/https), retorna direto
          if (img.startsWith("http")) return img;
          // Senão, monta URL completa com o BASE_URL
          return `${BASE_URL}${img}`;
        });

      setImageUrls(urls);
    } catch (err) {
      setError("Não foi possível carregar os anúncios.");
      console.error("useAnuncios error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { imageUrls, loading, error, refetch: fetchData };
}
