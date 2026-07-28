import React from "react";
import { Text, View } from "react-native";
import { styles } from "./styles";

interface TicketObservationProps {
  text: string | null;
}

export function TicketObservation({ text }: TicketObservationProps) {
  return (
    <View style={styles.observationSection}>
      <Text style={styles.sectionTitle}>Observação</Text>
      <View style={styles.observationCard}>
        <Text style={styles.observationText}>{text || ""}</Text>
      </View>
    </View>
  );
}
