import React from "react";
import { Text, View } from "react-native";
import { styles } from "./styles";

interface ValueRowData {
  label: string;
  amount: string;
}

interface TicketValuesProps {
  sectionTitle?: string;
  rows: ValueRowData[];
  totalLabel: string;
  totalAmount: string;
}

export function TicketValues({
  sectionTitle = "Valores",
  rows,
  totalLabel,
  totalAmount,
}: TicketValuesProps) {
  return (
    <View style={styles.valuesSection}>
      <Text style={styles.sectionTitle}>{sectionTitle}</Text>

      {rows.map((row, index) => (
        <View key={index} style={styles.valueRow}>
          <Text style={styles.valueLabel}>{row.label}</Text>
          <Text style={styles.valueAmount}>{row.amount}</Text>
        </View>
      ))}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{totalLabel}</Text>
        <Text style={styles.totalAmount}>{totalAmount}</Text>
      </View>
    </View>
  );
}
