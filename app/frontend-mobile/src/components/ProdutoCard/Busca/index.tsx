import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Star } from "lucide-react-native";
import { styles } from "./styles";
import { colors } from "../../../constants/Colors";
import type { Produto } from "../../../types";

interface ProdutoCardProps {
  produto: Produto;
}

/**
 * Card para exibir um produto em grid (2 colunas).
 * Mostra imagem, pontos (JP), nome, e info do estabelecimento com logo e avaliação.
 */
export function ProdutoCard({ produto }: ProdutoCardProps) {
  const router = useRouter();
  const { nome, imagem, pontos, estabelecimento_nome, estabelecimento_logo } = produto;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => router.push(`/produto/${produto.id}`)}
    >
      {/* Imagem do produto */}
      {imagem ? (
        <Image source={{ uri: imagem }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.imagePlaceholderText}>
            {nome.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      {/* Pontos */}
      <Text style={styles.points}>JP {pontos}</Text>

      {/* Nome do produto */}
      <Text style={styles.name} numberOfLines={1}>
        {nome}
      </Text>

      {/* Info do estabelecimento */}
      <View style={styles.storeRow}>
        {estabelecimento_logo ? (
          <Image source={{ uri: estabelecimento_logo }} style={styles.storeLogo} />
        ) : (
          <View style={[styles.storeLogo, styles.storeLogoPlaceholder]}>
            <Text style={styles.storeLogoText}>
              {estabelecimento_nome.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.storeDetails}>
          <Text style={styles.storeName} numberOfLines={1}>
            {estabelecimento_nome}
          </Text>
          <View style={styles.storeRatingRow}>
            {produto.estabelecimento_media_avaliacoes != null ? (
              <>
                <Text style={styles.storeRatingText}>
                  {produto.estabelecimento_media_avaliacoes.toFixed(1)}
                </Text>
                <Star size={10} color={colors.textPrimary} fill={colors.textPrimary} />
                <Text style={styles.storeRatingCount}>
                  ({produto.estabelecimento_total_avaliacoes})
                </Text>
              </>
            ) : (
              <Text style={styles.storeRatingText}>Novo</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}


