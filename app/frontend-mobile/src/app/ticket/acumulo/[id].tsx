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

import { colors } from "../../../constants/Colors";
import { api, ApiError, BASE_URL } from "../../../services/api";

import type { TicketCredito } from "../../../types";
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

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toFixed(2).replace(".", ",");
}

function getStatusConfig(status: string) {
  switch (status) {
    case "ABERTO":
      return { label: "Em Andamento", color: colors.brown[800] };
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

export default function AcompanharAcumuloScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [ticket, setTicket] = useState<TicketCredito | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // ─── Fetch ───────────────────────────────────────
  const fetchTicket = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.get<TicketCredito>(`/api/tickets/credito/${id}/`);
      setTicket(data);
    } catch (err) {
      console.error("Erro ao buscar ticket de acúmulo:", err);
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
      "Cancelar Acúmulo",
      "Tem certeza que deseja cancelar este pedido de acúmulo de pontos?",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim, cancelar",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              await api.post(`/api/tickets/credito/${id}/cancelar/`);
              Alert.alert("Sucesso", "Pedido de acúmulo cancelado.", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (err: any) {
              let message = "Não foi possível cancelar o pedido.";
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
        <Text style={styles.errorText}>Erro ao carregar dados do acúmulo.</Text>
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

  const notaImageUrl = ticket.imagem
    ? ticket.imagem.startsWith("http")
      ? ticket.imagem
      : `${BASE_URL}${ticket.imagem}`
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
      <TicketHeader title="Acúmulo de pontos" />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <EstablishmentHeader name={storeName} logoUrl={logoUrl} />

        <TicketCodeInfo codigo={ticket.codigo} createdAt={ticket.created_at} />

        <TicketDetailCard
          imageUri={notaImageUrl}
          placeholderText="Sem Foto"
          title={`Código da Nota: ${ticket.numero_nota}`}
          subTitle={`Valor: ${formatCurrency(ticket.preco)}`}
          subTitleColor={colors.textSecondary}
          extraText={`Data de Emissão: ${formatShortDate(ticket.data_nota)}`}
        />

        <TicketValues
          rows={[{ label: "Valor da Nota", amount: formatCurrency(ticket.preco) }]}
          totalLabel="Total de pontos"
          totalAmount={`${ticket.pontos ?? 0} pontos`}
        />

        {isFinalizado && <TicketUpdates rows={updateRows} />}

        {isFinalizado && <TicketObservation text={ticket.observacao} />}


        <View style={{ height: 80 }} />
      </ScrollView>

      {canCancel && <TicketCancelButton cancelling={cancelling} onPress={handleCancelar} />}

      <TicketStatusBar label={statusConfig.label} color={statusConfig.color} />
    </View>
  );
}
