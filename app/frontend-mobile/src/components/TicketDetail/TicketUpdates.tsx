import React from "react";
import { Text, View } from "react-native";
import { styles } from "./styles";

interface UpdateRow {
  label: string;
  date: string;
  bold?: boolean;
}

interface TicketUpdatesProps {
  rows: UpdateRow[];
}

/** Formata data ISO para "25 Janeiro 2025" */
function formatUpdateDate(dateStr: string): string {
  const date = new Date(dateStr);
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  return `${date.getDate()} ${meses[date.getMonth()]} ${date.getFullYear()}`;
}

export function TicketUpdates({ rows }: TicketUpdatesProps) {
  return (
    <View style={styles.updatesSection}>
      <Text style={styles.sectionTitle}>Atualizações</Text>
      {rows.map((row, index) => (
        <View key={index} style={styles.updateRow}>
          <Text style={[styles.updateLabel, row.bold && styles.updateLabelBold]}>
            {row.label}
          </Text>
          <Text style={styles.updateDate}>{formatUpdateDate(row.date)}</Text>
        </View>
      ))}
    </View>
  );
}
