import React from "react";
import { Text, View } from "react-native";
import { styles } from "./styles";

interface TicketCodeInfoProps {
  codigo: string;
  createdAt: string;
}

/** Formata data ISO para "Sex, 25 Janeiro 2025" */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return `${dias[date.getDay()]}, ${date.getDate()} ${
    meses[date.getMonth()]
  } ${date.getFullYear()}`;
}

export function TicketCodeInfo({ codigo, createdAt }: TicketCodeInfoProps) {
  return (
    <>
      <View style={styles.ticketInfoSection}>
        <Text style={styles.ticketCode}>Código do Ticket: {codigo}</Text>
      </View>
      <View style={styles.ticketDateContainer}>
        <Text style={styles.ticketDate}>{formatDate(createdAt)}</Text>
      </View>
    </>
  );
}
