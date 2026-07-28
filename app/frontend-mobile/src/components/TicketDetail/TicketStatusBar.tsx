import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./styles";

interface TicketStatusBarProps {
  label: string;
  color: string;
}

export function TicketStatusBar({ label, color }: TicketStatusBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.statusBar,
        { backgroundColor: color, paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      <Text style={styles.statusBarText}>{label}</Text>
    </View>
  );
}
