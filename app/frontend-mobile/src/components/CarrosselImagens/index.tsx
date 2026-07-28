import * as React from "react";
import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance, Pagination } from "react-native-reanimated-carousel";

import { window } from "../../constants/sizes";
import { renderItem } from "../../utils/render-item";
import { styles } from "./styles";

// Dados de exemplo - substitua por suas imagens reais depois
const defaultDataWith4Colors = [
  "#B0604D",
  "#899F9C",
  "#B3C680",
  "#5C6265",
];

interface CarrosselImagensProps {
  /** Array de URLs de imagens ou cores */
  data?: string[];
  /** Altura do carrossel */
  height?: number;
  /** Se deve ter autoplay */
  autoPlay?: boolean;
  /** Intervalo do autoplay em ms */
  autoPlayInterval?: number;
}

/**
 * Componente de carrossel de imagens usando react-native-reanimated-carousel.
 *
 * Pode receber:
 * - URLs de imagens: ["https://...", "https://..."]
 * - Cores hexadecimais: ["#FF0000", "#00FF00"]
 */
export function CarrosselImagens({
  data = defaultDataWith4Colors,
  height = 200,
  autoPlay = true,
  autoPlayInterval = 2000,
}: CarrosselImagensProps) {
  const progress = useSharedValue<number>(0);
  const ref = React.useRef<ICarouselInstance>(null);

  // Calcula a largura do carrossel baseado na largura da tela
  const carouselWidth = window.width - 16;

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      <Carousel
        ref={ref}
        loop
        enabled={true}
        snapEnabled={true}
        pagingEnabled={true}
        autoPlay={autoPlay}
        autoPlayInterval={autoPlayInterval}
        data={data}
        width={carouselWidth}
        height={height}
        onProgressChange={(_, absoluteProgress) => {
          progress.value = absoluteProgress;
        }}
        renderItem={renderItem({ rounded: true })}
        style={styles.carousel}
      />
      <Pagination.Basic<{ color: string }>
        progress={progress}
        data={data.map((color) => ({ color }))}
        size={10}
        dotStyle={{
          borderRadius: 100,
          backgroundColor: "#26262640",
        }}
        activeDotStyle={{
          borderRadius: 100,
          backgroundColor: "#262626",
        }}
        containerStyle={{
          gap: 8,
          marginTop: 16,
        }}
        horizontal
        onPress={onPressPagination}
      />
    </View>
  );
}

export default CarrosselImagens;