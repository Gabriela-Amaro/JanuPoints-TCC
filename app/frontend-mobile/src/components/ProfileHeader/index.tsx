import React, { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { colors } from "../../constants/Colors";
import { styles } from "./styles";

export interface ProfileHeaderProps {
  /** Título exibido no centro do cabeçalho */
  title: string;
  /** Ação customizada para o botão de voltar. Se omitida, chama `router.back()` */
  onBack?: () => void;
  /** Elemento opcional exibido no canto direito para manter alinhamento */
  rightContent?: ReactNode;
}

/**
 * Cabeçalho exclusivo para as sub-páginas abertas a partir da aba Perfil (Conta, Segurança, Sobre, etc.).
 * Garante o fundo bege característico da aba Perfil e o espaçamento seguro da barra de status.
 */
export function ProfileHeader({
  title,
  onBack,
  rightContent,
}: ProfileHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top + 8, 20),
        },
      ]}
    >
      <TouchableOpacity
        onPress={handleBack}
        style={styles.backButton}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ChevronLeft size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.rightContainer}>
        {rightContent || <View style={styles.placeholderRight} />}
      </View>
    </View>
  );
}
