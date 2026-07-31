import React from "react";
import { Image, Text, View } from "react-native";
import { colors } from "../../constants/Colors";
import { styles } from "./styles";

interface EstablishmentHeaderProps {
  name: string;
  logoUrl: string | null;
}

/** Cabeçalho objetivo usado no acompanhamento das solicitações. */
export function EstablishmentHeader({ name, logoUrl }: EstablishmentHeaderProps) {
  return (
    <View style={styles.establishmentSection}>
      <View style={styles.establishmentInfo}>
        <Text style={styles.establishmentName}>{name}</Text>
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
