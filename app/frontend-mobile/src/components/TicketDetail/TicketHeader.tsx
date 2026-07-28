import React from "react";
import { Text, View } from "react-native";
import { BackButton } from "../Buttons/Back";
import { colors } from "../../constants/Colors";
import { styles } from "./styles";

interface TicketHeaderProps {
  title: string;
}

export function TicketHeader({ title }: TicketHeaderProps) {
  return (
    <View style={styles.header}>
      <BackButton color={colors.textPrimary} style={styles.backButton} />
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}
