import React from "react";
import { Image, TouchableOpacity, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { styles } from "./styles";
import { BASE_URL } from "../../services/api";
import type { Estabelecimento } from "../../types";

interface EstabelecimentoCardProps {
  estabelecimento: Estabelecimento;
  /** Exibir o endereço abaixo do nome (padrão: false) */
  showEndereco?: boolean;
}

/**
 * Card reutilizável para exibir informações de um estabelecimento.
 * Mostra logotipo (ou inicial como placeholder), nome e descrição.
 */
export function EstabelecimentoCard({
  estabelecimento,
  showEndereco = false,
}: EstabelecimentoCardProps) {
  const router = useRouter();
  const { nome, logotipo, descricao } = estabelecimento;

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

      </View>
    </TouchableOpacity>
  );
}