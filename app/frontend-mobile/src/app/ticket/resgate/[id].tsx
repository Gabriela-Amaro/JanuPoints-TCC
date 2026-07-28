import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Star } from "lucide-react-native";
import { colors } from "../../../constants/Colors";
import { api, ApiError, BASE_URL } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import type { TicketDebito, AvaliacaoEstabelecimento } from "../../../types";
import { TicketHeader } from "../../../components/TicketDetail/TicketHeader";
import { EstablishmentHeader } from "../../../components/TicketDetail/EstablishmentHeader";
import { TicketCodeInfo } from "../../../components/TicketDetail/TicketCodeInfo";
import { TicketDetailCard } from "../../../components/TicketDetail/TicketDetailCard";
import { TicketValues } from "../../../components/TicketDetail/TicketValues";
import { TicketCancelButton } from "../../../components/TicketDetail/TicketCancelButton";
import { TicketStatusBar } from "../../../components/TicketDetail/TicketStatusBar";
import { TicketUpdates } from "../../../components/TicketDetail/TicketUpdates";
import { TicketObservation } from "../../../components/TicketDetail/TicketObservation";
import { styles } from "../../../components/TicketDetail/styles";

// ─── Helpers ─────────────────────────────────────────

function getStatusConfig(status: string) {
  switch (status) {
    case "ABERTO":
      return { label: "Em Andamento", color: colors.brown[800] };
    case "APROVADO":
      return { label: "Em Preparo", color: colors.orange };
    case "CONCLUIDO":
      return { label: "Aprovado", color: colors.success };
    case "CANCELADO":
      return { label: "Cancelado", color: colors.gray[500] };
    case "RECUSADO":
      return { label: "Recusado", color: colors.error };
    default:
      return { label: status, color: colors.gray[500] };
  }
}

function getStatusDateLabel(status: string): string {
  switch (status) {
    case "APROVADO":
    case "CONCLUIDO":
      return "Data de Aprovação";
    case "CANCELADO":
      return "Data de Cancelamento";
    case "RECUSADO":
      return "Data de Recusa";
    default:
      return "Data de Atualização";
  }
}

export default function AcompanharResgateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [ticket, setTicket] = useState<TicketDebito | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // ─── Fetch ───────────────────────────────────────
  const fetchTicket = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.get<TicketDebito>(`/api/tickets/debito/${id}/`);
      setTicket(data);
    } catch (err) {
      console.error("Erro ao buscar ticket de resgate:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  // ─── Cancelar ────────────────────────────────────
  const handleCancelar = () => {
    Alert.alert(
      "Cancelar Resgate",
      "Tem certeza que deseja cancelar este resgate? Seus pontos serão estornados.",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim, cancelar",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              await api.post(`/api/tickets/debito/${id}/cancelar/`);
              Alert.alert("Sucesso", "Resgate cancelado e pontos estornados.", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (err: any) {
              let message = "Não foi possível cancelar o resgate.";
              if (err instanceof ApiError && err.data) {
                if (err.data.error) message = String(err.data.error);
                else if (err.data.detail) message = String(err.data.detail);
              }
              Alert.alert("Erro", message);
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  // ─── Loading ─────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brown[800]} />
      </View>
    );
  }

  // ─── Error ───────────────────────────────────────
  if (error || !ticket) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Erro ao carregar dados do resgate.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── URLs das imagens ────────────────────────────
  const logoUrl = ticket.logo_estabelecimento
    ? ticket.logo_estabelecimento.startsWith("http")
      ? ticket.logo_estabelecimento
      : `${BASE_URL}${ticket.logo_estabelecimento}`
    : null;

  const productImageUrl = ticket.imagem_produto
    ? ticket.imagem_produto.startsWith("http")
      ? ticket.imagem_produto
      : `${BASE_URL}${ticket.imagem_produto}`
    : null;

  const storeName = ticket.nome_estabelecimento ?? "Loja";
  const statusConfig = getStatusConfig(ticket.status);
  const canCancel = ticket.status === "ABERTO";
  const isFinalizado = ["CONCLUIDO", "CANCELADO", "RECUSADO"].includes(ticket.status);

  // ─── Atualizações rows ──────────────────────────
  const updateRows = [
    { label: "Data de Abertura", date: ticket.created_at },
  ];
  if (ticket.status !== "ABERTO") {
    updateRows.push({
      label: getStatusDateLabel(ticket.status),
      date: ticket.updated_at,
      bold: true,
    } as any);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TicketHeader title="Resgate de Pontos" />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <EstablishmentHeader
          name={storeName}
          logoUrl={logoUrl}
          mediaAvaliacoes={ticket.media_avaliacoes}
          totalAvaliacoes={ticket.total_avaliacoes}
        />

        <TicketCodeInfo codigo={ticket.codigo} createdAt={ticket.created_at} />

        <TicketDetailCard
          imageUri={productImageUrl}
          placeholderText="Sem Foto"
          title={ticket.nome_produto}
          subTitle={ticket.descricao_produto}
          subTitleColor={colors.orange}
          extraText="Quantidade: 1"
        />

        <TicketValues
          rows={[{ label: "Subtotal", amount: `JP ${ticket.pontos}` }]}
          totalLabel="Total"
          totalAmount={`JP ${ticket.pontos}`}
        />

        {isFinalizado && <TicketUpdates rows={updateRows} />}

        {isFinalizado && <TicketObservation text={ticket.observacao} />}

        {ticket.avaliacao && (
          <View style={styles.ratingCard}>
            <Text style={styles.ratingCardTitle}>Sua avaliação</Text>
            <View style={styles.ratingCardStarsRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={14}
                  color={i <= (ticket.avaliacao?.nota ?? 0) ? colors.orange : colors.gray[500]}
                  fill={i <= (ticket.avaliacao?.nota ?? 0) ? colors.orange : "transparent"}
                  style={{ marginRight: 4 }}
                />
              ))}
            </View>
            {ticket.avaliacao.comentario ? (
              <Text style={styles.ratingCardComment}>"{ticket.avaliacao.comentario}"</Text>
            ) : null}
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {canCancel && <TicketCancelButton cancelling={cancelling} onPress={handleCancelar} />}

      <TicketStatusBar label={statusConfig.label} color={statusConfig.color} />
    </View>
  );
}
