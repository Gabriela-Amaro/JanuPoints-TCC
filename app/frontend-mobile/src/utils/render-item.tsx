import React from "react";
import { Image, StyleSheet, View } from "react-native";

interface RenderItemOptions {
  rounded?: boolean;
}

interface ItemProps {
  item: string; // A cor ou URL da imagem
  index: number;
}

/**
 * Função que retorna um componente para renderizar cada item do carrossel.
 * 
 * @param options - Opções de customização
 * @param options.rounded - Se true, aplica bordas arredondadas no item
 * @returns Uma função que renderiza cada item do carrossel
 */
export function renderItem(options: RenderItemOptions = {}) {
  const { rounded = false } = options;

  return ({ item, index }: ItemProps) => {
    const isColor = item.startsWith("#");

    return (
      <View
        style={[
          styles.itemContainer,
          rounded && styles.rounded,
        ]}
      >
        {isColor ? (
          // Se for uma cor, renderiza um View colorido
          <View style={[styles.colorItem, { backgroundColor: item }]} />
        ) : (
          // Se for URL, renderiza uma imagem
          <Image
            source={{ uri: item }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
      </View>
    );
  };
}

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  rounded: {
    borderRadius: 16,
  },
  colorItem: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
