import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackButton } from "../../components/Buttons/Back";
import { colors } from "../../constants/Colors";
import { api, BASE_URL } from "../../services/api";
import type { Produto } from "../../types";
import { styles } from "./styles";

export default function ProdutoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchProduto() {
      setLoading(true);
      setError(false);
      try {
        const prod = await api.get<Produto>(`/api/produtos/${id}/`);
        setProduto(prod);
      } catch (err) {
        console.error("Erro ao buscar detalhes do produto:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchProduto();
  }, [id]);

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
        <Text style={styles.errorText}>Erro ao carregar os dados do produto.</Text>
        <TouchableOpacity style={styles.footerButton} onPress={() => router.back()}>
          <Text style={styles.footerButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const productImageUrl = produto.imagem
    ? produto.imagem.startsWith("http")
      ? produto.imagem
      : `${BASE_URL}${produto.imagem}`
    : null;

  const logoUrl = produto.estabelecimento_logo
    ? produto.estabelecimento_logo.startsWith("http")
      ? produto.estabelecimento_logo
      : `${BASE_URL}${produto.estabelecimento_logo}`
    : null;

  const bannerHeight = 280;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner com a imagem do produto */}
        <View style={[styles.bannerContainer, { height: bannerHeight }]}>
          {productImageUrl ? (
            <Image
              source={{ uri: productImageUrl }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.bannerImagePlaceholder}>
              <Text style={styles.placeholderText}>Sem Imagem</Text>
            </View>
          )}

          {/* Botão de voltar */}
          <BackButton />

          {/* Badge do estabelecimento */}
          <View style={styles.establishmentBadge}>
            {logoUrl ? (
              <Image source={{ uri: logoUrl }} style={styles.establishmentLogo} />
            ) : (
              <View style={[styles.establishmentLogo, styles.logoPlaceholder]}>
                <Text style={styles.logoPlaceholderText}>
                  {produto.estabelecimento_nome?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.establishmentName}>{produto.estabelecimento_nome}</Text>
          </View>
        </View>

        {/* Informações do Produto */}
        <View style={styles.contentContainer}>
          <Text style={styles.productName}>{produto.nome}</Text>
          {produto.descricao ? (
            <Text style={styles.productDesc}>{produto.descricao}</Text>
          ) : null}
          <Text style={styles.productPoints}>JP {produto.pontos}</Text>
        </View>
      </ScrollView>

      {/* Footer de ações */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerTotalLabel}>Total do Pedido</Text>
          <Text style={styles.footerTotalValue}>JP {produto.pontos}</Text>
        </View>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => router.push(`/produto/confirmar/${produto.id}`)}
        >
          <Text style={styles.footerButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
