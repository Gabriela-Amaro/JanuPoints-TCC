import React from "react";
import { Image, Text, View } from "react-native";
import { styles } from "./styles";

interface TicketDetailCardProps {
  imageUri: string | null;
  placeholderText: string;
  title: string;
  subTitle?: string;
  subTitleColor?: string;
  extraText?: string;
}

export function TicketDetailCard({
  imageUri,
  placeholderText,
  title,
  subTitle,
  subTitleColor,
  extraText,
}: TicketDetailCardProps) {
  return (
    <View style={styles.cardContainer}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.cardImage} />
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.placeholderText}>{placeholderText}</Text>
        </View>
      )}
      <View style={styles.cardDetails}>
        <Text style={styles.cardTitle}>{title}</Text>
        {subTitle ? (
          <Text style={[styles.cardSubtitle, subTitleColor ? { color: subTitleColor } : {}]}>
            {subTitle}
          </Text>
        ) : null}
        {extraText ? <Text style={styles.cardExtra}>{extraText}</Text> : null}
      </View>
    </View>
  );
}
