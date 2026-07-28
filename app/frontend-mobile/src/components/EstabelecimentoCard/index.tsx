import React from "react";
import { Image, TouchableOpacity, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Star } from "lucide-react-native";
import { styles } from "./styles";
import { BASE_URL } from "../../services/api";
import type { Estabelecimento } from "../../types";
import { colors } from "@/src/constants/Colors";

interface EstabelecimentoCardProps {
  estabelecimento: Estabelecimento;
  /** Exibir o endereço abaixo do nome (padrão: false) */
  showEndereco?: boolean;
}

/**
 * Card reutilizável para exibir informações de um estabelecimento.
 * Mostra logotipo (ou inicial como placeholder), nome, avaliação e descrição.
 */
export function EstabelecimentoCard({
  estabelecimento,
  showEndereco = false,
}: EstabelecimentoCardProps) {
  const router = useRouter();
  const { nome, logotipo, descricao, endereco, media_avaliacoes } = estabelecimento;

  const logoUrl = logotipo
    ? logotipo.startsWith("http")
      ? logotipo
      : `${BASE_URL}${logotipo}`
    : null;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/estabelecimento/${estabelecimento.id}`)}
      style={styles.card}
    >
      {/* Avaliação fixa no canto superior direito */}
      <View style={styles.rating}>
        {media_avaliacoes != null ? (
          <>
            <Text style={styles.ratingText}>{media_avaliacoes.toFixed(1)}</Text>
            <Star size={12} color={colors.textPrimary} fill={colors.textPrimary} />
          </>
        ) : 
        <Text style={styles.noStarText}>
          Novo
        </Text>}
      </View>

      {logoUrl ? (
        <Image source={{ uri: logoUrl }} style={styles.logo} />
      ) : (
        <View style={[styles.logo, styles.logoPlaceholder]}>
          <Text style={styles.logoText}>
            {nome.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {nome}
        </Text>
        {descricao ? (
          <Text style={styles.description} numberOfLines={2}>
            {descricao}
          </Text>
        ) : null}
        {/* {endereco ? (
          <Text style={styles.address} numberOfLines={1}>
            {endereco}
          </Text>
        ) : null} */}
      </View>
    </TouchableOpacity>
  );
}