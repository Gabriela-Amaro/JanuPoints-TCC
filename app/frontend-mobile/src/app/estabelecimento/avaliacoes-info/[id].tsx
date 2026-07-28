import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Star } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../../constants/Colors";
import { api, BASE_URL } from "../../../services/api";
import type { Estabelecimento, AvaliacaoEstabelecimento } from "../../../types";
import { styles } from "./styles";

type TabOption = "avaliacoes" | "informacoes";

const DAYS_ORDER = [
  { key: "segunda", label: "Segunda-feira" },
  { key: "terca", label: "Terça-feira" },
  { key: "quarta", label: "Quarta-feira" },
  { key: "quinta", label: "Quinta-feira" },
  { key: "sexta", label: "Sexta-feira" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

/** Formata data para o padrão '11 Jul. 2025' */
function formatReviewDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const meses = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];

    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const ano = date.getFullYear();

    return `${dia} ${mes}. ${ano}`;
  } catch {
    return "";
  }
}

/** Card de Avaliação Individual */
function ReviewCard({ review }: { review: AvaliacaoEstabelecimento }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{review.nome_autor}</Text>
          <Text style={styles.reviewDate}>{formatReviewDate(review.created_at)}</Text>
        </View>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={14}
              color={i <= review.nota ? colors.orange : colors.gray[500]}
              fill={i <= review.nota ? colors.orange : "transparent"}
              style={{ marginLeft: 2 }}
            />
          ))}
        </View>
      </View>
      {review.comentario ? (
        <Text style={styles.reviewComment}>{review.comentario}</Text>
      ) : null}
    </View>
  );
}

/** Aba de Informações */
function TabInfo({ establishment }: { establishment: Estabelecimento }) {
  return (
    <ScrollView style={styles.infoTabContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.infoTitle}>Horário de funcionamento</Text>
      <View style={styles.hoursList}>
        {DAYS_ORDER.map((day) => {
          const time = establishment.horario_funcionamento?.[day.key] || "Fechado";
          return (
            <Text key={day.key} style={styles.hoursText}>
              {day.label}: {time}
            </Text>
          );
        })}
      </View>

      <Text style={styles.infoTitle}>Telefone</Text>
      <Text style={styles.infoText}>
        {establishment.telefone || "Não informado"}
      </Text>

      <Text style={styles.infoTitle}>Endereço:</Text>
      <Text style={styles.infoText}>
        {establishment.endereco || "Não informado"}
      </Text>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

export default function EstabelecimentoAvaliacoesInfoScreen() {
  const { id, initialTab } = useLocalSearchParams<{ id: string; initialTab?: TabOption }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabOption>("avaliacoes");
  const [establishment, setEstablishment] = useState<Estabelecimento | null>(null);
  const [reviews, setReviews] = useState<AvaliacaoEstabelecimento[]>([]);
  const [loadingEst, setLoadingEst] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Inicializa a aba com base no parâmetro de busca
  useEffect(() => {
    if (initialTab === "avaliacoes" || initialTab === "informacoes") {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Carrega informações do estabelecimento
  useEffect(() => {
    const fetchEstablishment = async () => {
      setLoadingEst(true);
      try {
        const data = await api.get<Estabelecimento>(`/api/estabelecimentos/${id}/`);
        setEstablishment(data);
      } catch (err) {
        console.error("Erro ao buscar estabelecimento:", err);
      } finally {
        setLoadingEst(false);
      }
    };

    if (id) {
      fetchEstablishment();
    }
  }, [id]);

  // Carrega avaliações do estabelecimento
  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const data = await api.get<AvaliacaoEstabelecimento[]>(
        `/api/avaliacoes/estabelecimento/?estabelecimento=${id}`
      );
      setReviews(data);
    } catch (err) {
      console.error("Erro ao buscar avaliações:", err);
    } finally {
      setLoadingReviews(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && activeTab === "avaliacoes") {
      fetchReviews();
    }
  }, [id, activeTab, fetchReviews]);

  if (loadingEst) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.brown[800]} />
      </View>
    );
  }

  if (!establishment) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: "center", alignItems: "center" }]}>
        <Text style={styles.emptyText}>Estabelecimento não encontrado.</Text>
      </View>
    );
  }

  const logoUrl = establishment.logotipo
    ? establishment.logotipo.startsWith("http")
      ? establishment.logotipo
      : `${BASE_URL}${establishment.logotipo}`
    : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header com botão de voltar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Resumo do Estabelecimento */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryTopRow}>
          <Text style={styles.establishmentName} numberOfLines={2}>
            {establishment.nome}
          </Text>
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoPlaceholderText}>
                {establishment.nome.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.summaryBottomRow}>
          <View style={styles.ratingRow}>
            {establishment.media_avaliacoes != null ? (
              <>
                <Text style={styles.ratingText}>
                  {establishment.media_avaliacoes.toFixed(1)}
                </Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={14}
                      color={
                        i <= Math.round(establishment.media_avaliacoes || 0)
                          ? colors.orange
                          : colors.gray[500]
                      }
                      fill={
                        i <= Math.round(establishment.media_avaliacoes || 0)
                          ? colors.orange
                          : "transparent"
                      }
                      style={{ marginRight: 2 }}
                    />
                  ))}
                </View>
              </>
            ) : (
              <Text style={styles.ratingText}>Sem avaliações</Text>
            )}
          </View>

          <Text style={styles.reviewsCount}>
            {establishment.total_avaliacoes} Avaliações
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "avaliacoes" && styles.tabButtonActive]}
          onPress={() => setActiveTab("avaliacoes")}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === "avaliacoes" && styles.tabTextActive]}>
            Avaliações
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "informacoes" && styles.tabButtonActive]}
          onPress={() => setActiveTab("informacoes")}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === "informacoes" && styles.tabTextActive]}>
            Informações
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo da Aba */}
      <View style={styles.tabContent}>
        {activeTab === "avaliacoes" ? (
          loadingReviews ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={colors.brown[800]} />
            </View>
          ) : reviews.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma avaliação enviada ainda.</Text>
          ) : (
            <FlatList
              data={reviews}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <ReviewCard review={item} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            />
          )
        ) : (
          <TabInfo establishment={establishment} />
        )}
      </View>
    </View>
  );
}
