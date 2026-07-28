import React from "react";
import { Image, Text, View } from "react-native";
import { Star } from "lucide-react-native";
import { colors } from "../../constants/Colors";
import { styles } from "./styles";

interface EstablishmentHeaderProps {
  name: string;
  logoUrl: string | null;
  mediaAvaliacoes: number | null;
  totalAvaliacoes: number;
}

export function EstablishmentHeader({
  name,
  logoUrl,
  mediaAvaliacoes,
  totalAvaliacoes,
}: EstablishmentHeaderProps) {
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
    <View style={styles.establishmentSection}>
      <View style={styles.establishmentInfo}>
        <Text style={styles.establishmentName}>{name}</Text>
        <View style={styles.ratingRow}>
          {mediaAvaliacoes != null ? (
            <>
              <Text style={styles.ratingText}>{mediaAvaliacoes.toFixed(1)}</Text>
              <View style={styles.ratingStars}>{renderStars(mediaAvaliacoes)}</View>
              <Text style={styles.ratingCount}>{totalAvaliacoes} Avaliações</Text>
            </>
          ) : (
            <Text style={styles.ratingText}>Novo</Text>
          )}
        </View>
      </View>

      {logoUrl ? (
        <Image source={{ uri: logoUrl }} style={styles.establishmentLogo} />
      ) : (
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoPlaceholderText}>
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
    </View>
  );
}
