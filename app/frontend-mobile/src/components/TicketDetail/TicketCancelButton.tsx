import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/Colors";
import { styles } from "./styles";

interface TicketCancelButtonProps {
  cancelling: boolean;
  onPress: () => void;
}

export function TicketCancelButton({ cancelling, onPress }: TicketCancelButtonProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <TouchableOpacity
        style={[styles.cancelButton, cancelling && styles.cancelButtonDisabled]}
        onPress={onPress}
        disabled={cancelling}
      >
        {cancelling ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
