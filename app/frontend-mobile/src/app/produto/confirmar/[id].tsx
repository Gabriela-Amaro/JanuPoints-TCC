import { useLocalSearchParams, useRouter } from "expo-router";
import { Star } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackButton } from "../../../components/Buttons/Back";
import { colors } from "../../../constants/Colors";
import { api, ApiError, BASE_URL } from "../../../services/api";
import type { Produto } from "../../../types";
import { styles } from "./styles";

export default function ConfirmarPedidoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProduto() {
      setLoading(true);
      setError(false);
      try {
        const prod = await api.get<Produto>(`/api/produtos/${id}/`);
        setProduto(prod);
      } catch (err) {
        console.error("Erro ao buscar detalhes do produto para confirmação:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchProduto();
  }, [id]);

  const handleFazerPedido = async () => {
    if (!produto) return;
    setSubmitting(true);
    try {
      const response = await api.post<{ id: number }>("/api/tickets/debito/", { produto: produto.id });
      Alert.alert("Sucesso", "Pedido realizado com sucesso!", [
        {
          text: "OK",
          onPress: () => {
            // Redireciona para a tela de transações e abre a tela de acompanhamento
            router.replace("/(tabs)/transacoes");
            router.push(`/ticket/resgate/${response.id}`);
          },
        },
      ]);
    } catch (err: any) {
      console.error("Erro ao finalizar pedido:", err);
      let message = "Ocorreu um erro ao processar o seu pedido. Tente novamente.";
      if (err instanceof ApiError && err.data) {
        if (err.data.detail) {
          message = String(err.data.detail);
        } else if (err.data.non_field_errors) {
          message = Array.isArray(err.data.non_field_errors)
            ? String(err.data.non_field_errors[0])
            : String(err.data.non_field_errors);
        } else {
          const keys = Object.keys(err.data);
          if (keys.length > 0) {
            const firstVal = err.data[keys[0]];
            message = Array.isArray(firstVal) ? String(firstVal[0]) : String(firstVal);
          }
        }
      }
      Alert.alert("Erro", message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brown[800]} />
      </View>
    );
  }

  if (error || !produto) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erro ao carregar dados do pedido.</Text>
        <TouchableOpacity style={styles.submitButton} onPress={() => router.back()}>
          <Text style={styles.submitButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const logoUrl = produto.estabelecimento_logo
    ? produto.estabelecimento_logo.startsWith("http")
      ? produto.estabelecimento_logo
      : `${BASE_URL}${produto.estabelecimento_logo}`
    : null;

  const productImageUrl = produto.imagem
    ? produto.imagem.startsWith("http")
      ? produto.imagem
      : `${BASE_URL}${produto.imagem}`
    : null;

  const renderStars = (rating: number | null) => {
    const rounded = Math.round(rating ?? 0);
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={12}
        color={colors.textPrimary}
        fill={i < rounded ? colors.textPrimary : "transparent"}
        style={{ marginRight: 2 }}
      />
    ));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton color={colors.textPrimary} style={styles.backButton} />
        
        <View style={styles.headerInfo}>
          <Text style={styles.storeName}>{produto.estabelecimento_nome}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>
              {produto.estabelecimento_media_avaliacoes?.toFixed(1) || "0.0"}
            </Text>
            <View style={styles.ratingStars}>
              {renderStars(produto.estabelecimento_media_avaliacoes)}
            </View>
            <Text style={styles.ratingCount}>
              ({produto.estabelecimento_total_avaliacoes} Avaliações)
            </Text>
          </View>
        </View>

        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={styles.storeLogo} />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoPlaceholderText}>
              {produto.estabelecimento_nome?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Produto Card */}
        <View style={styles.productCard}>
          {productImageUrl ? (
            <Image source={{ uri: productImageUrl }} style={styles.productImage} />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Text style={styles.placeholderText}>Sem Foto</Text>
            </View>
          )}
          <View style={styles.productDetails}>
            <Text style={styles.productName}>{produto.nome}</Text>
            {produto.descricao ? (
              <Text style={styles.productDesc} numberOfLines={2}>
                {produto.descricao}
              </Text>
            ) : null}
            <Text style={styles.quantityText}>Quantidade: 1</Text>
          </View>
        </View>

        {/* Valores */}
        <View style={styles.valuesSection}>
          <Text style={styles.sectionTitle}>Valores</Text>
          
          <View style={styles.valueRow}>
            <Text style={styles.valueLabel}>Subtotal</Text>
            <Text style={styles.valueAmount}>JP {produto.pontos}</Text>
          </View>

          <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: colors.separator }]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>JP {produto.pontos}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleFazerPedido}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Fazer Pedido</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
