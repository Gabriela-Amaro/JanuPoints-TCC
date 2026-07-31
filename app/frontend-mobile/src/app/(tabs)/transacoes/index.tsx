import React, { useCallback, useState } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "../../../components/ScreenContainer/tabs/ScreenContainer";
import { RefreshableScrollView } from "../../../components/RefreshableScrollView";
import { useAuth } from "../../../contexts/AuthContext";
import { useTransacoes } from "../../../hooks/useTransacoes";
import { colors } from "../../../constants/Colors";
import { BASE_URL } from "../../../services/api";
import { styles } from "./styles";
import type { Transacao } from "../../../types";

type FilterTab = "todos" | "pendentes" | "finalizados";

function getStatusLabel(status: string) {
  switch (status) {
    case "ABERTO":
      return "Aguardando análise";
    case "APROVADO":
      return "Aprovado";
    case "CONCLUIDO":
      return "Concluído";
    case "RECUSADO":
      return "Recusado";
    case "CANCELADO":
      return "Cancelado";
    default:
      return "Em análise";
  }
}

function getStatusColor(status: string) {
  if (status === "RECUSADO" || status === "CANCELADO") return colors.errorDark;
  if (status === "APROVADO" || status === "CONCLUIDO") return colors.successDark;
  return colors.warning;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR");
}

function TransactionCard({ transaction }: { transaction: Transacao }) {
  const router = useRouter();
  const isCredit = transaction.tipo === "credito";
  const points = transaction.pontos ?? 0;
  const title = isCredit ? "Acúmulo de pontos" : "Resgate de pontos";
  const storeName = transaction.nome_estabelecimento ?? "Estabelecimento";

  const logoUrl = transaction.logo_estabelecimento
    ? transaction.logo_estabelecimento.startsWith("http")
      ? transaction.logo_estabelecimento
      : `${BASE_URL}${transaction.logo_estabelecimento}`
    : null;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
        router.push(
          isCredit
            ? `/ticket/acumulo/${transaction.id}`
            : `/ticket/resgate/${transaction.id}`
        )
      }
    >
      <View style={styles.cardTop}>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.cardTitle}>{title}</Text>
          <View style={styles.storeRow}>
            {logoUrl ? (
              <Image source={{ uri: logoUrl }} style={styles.storeLogo} />
            ) : (
              <View style={[styles.storeLogo, styles.storeLogoPlaceholder]}>
                <Text style={styles.storeLogoText}>
                  {storeName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.storeName} numberOfLines={1}>
              {storeName}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.points,
            { color: isCredit ? colors.successDark : colors.errorDark },
          ]}
        >
          {isCredit ? "+" : "-"}{points} pontos
        </Text>
      </View>
      <View style={styles.cardBottom}>
        <Text style={styles.date}>{formatDate(transaction.created_at)}</Text>
        <Text
          style={[
            styles.status,
            { color: getStatusColor(transaction.status) },
          ]}
        >
          {getStatusLabel(transaction.status)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/** Histórico separado entre movimentações aguardando análise e finalizadas. */
export default function Transacoes() {
  const { user, refreshUser } = useAuth();
  const { data, loading, refetch } = useTransacoes();
  const [activeTab, setActiveTab] = useState<FilterTab>("todos");

  const handleRefresh = useCallback(async () => {
    await Promise.all([refetch(), refreshUser()]);
  }, [refetch, refreshUser]);

  const pendingTransactions = data.filter((t) => t.status === "ABERTO");
  const finishedTransactions = data.filter((t) => t.status !== "ABERTO");

  return (
    <ScreenContainer
      headerContent={
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerLabel}>Histórico</Text>
            <Text style={styles.headerTitle}>Movimentações</Text>
          </View>
          <Text style={styles.headerPoints}>{user?.pontos ?? 0} pts</Text>
        </View>
      }
    >
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.brown[800]}
          style={{ marginTop: 40 }}
        />
      ) : (
        <RefreshableScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefresh}
        >
          <Text style={styles.helperText}>
            Acompanhe aqui o andamento dos seus acúmulos e resgates.
          </Text>

          {/* Abas de filtro */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "todos" && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab("todos")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "todos" && styles.tabTextActive,
                ]}
              >
                Todos ({data.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "pendentes" && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab("pendentes")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "pendentes" && styles.tabTextActive,
                ]}
              >
                Em análise ({pendingTransactions.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "finalizados" && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab("finalizados")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "finalizados" && styles.tabTextActive,
                ]}
              >
                Finalizados ({finishedTransactions.length})
              </Text>
            </TouchableOpacity>
          </View>

          {data.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma movimentação encontrada.</Text>
          ) : (
            <>
              {/* Seção: Aguardando análise */}
              {(activeTab === "todos" || activeTab === "pendentes") && (
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Aguardando análise</Text>
                    <View style={styles.badgePending}>
                      <Text style={styles.badgePendingText}>
                        {pendingTransactions.length}
                      </Text>
                    </View>
                  </View>

                  {pendingTransactions.length === 0 ? (
                    <View style={styles.emptySectionCard}>
                      <Text style={styles.emptySectionText}>
                        Nenhuma solicitação aguardando análise.
                      </Text>
                    </View>
                  ) : (
                    pendingTransactions.map((transaction) => (
                      <TransactionCard
                        key={`${transaction.tipo}-${transaction.id}`}
                        transaction={transaction}
                      />
                    ))
                  )}
                </View>
              )}

              {/* Seção: Finalizados */}
              {(activeTab === "todos" || activeTab === "finalizados") && (
                <View
                  style={[
                    styles.sectionContainer,
                    { marginTop: activeTab === "todos" ? 16 : 0 },
                  ]}
                >
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Finalizados</Text>
                    <View style={styles.badgeFinished}>
                      <Text style={styles.badgeFinishedText}>
                        {finishedTransactions.length}
                      </Text>
                    </View>
                  </View>

                  {finishedTransactions.length === 0 ? (
                    <View style={styles.emptySectionCard}>
                      <Text style={styles.emptySectionText}>
                        Nenhuma movimentação finalizada.
                      </Text>
                    </View>
                  ) : (
                    finishedTransactions.map((transaction) => (
                      <TransactionCard
                        key={`${transaction.tipo}-${transaction.id}`}
                        transaction={transaction}
                      />
                    ))
                  )}
                </View>
              )}
            </>
          )}

          <View style={{ height: 24 }} />
        </RefreshableScrollView>
      )}
    </ScreenContainer>
  );
}
