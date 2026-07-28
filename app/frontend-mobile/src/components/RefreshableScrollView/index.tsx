import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, ScrollViewProps } from "react-native";
import { colors } from "../../constants/Colors";

interface RefreshableScrollViewProps extends ScrollViewProps {
  /** Função async chamada ao puxar para baixo */
  onRefresh: () => Promise<void> | void;
}

/**
 * ScrollView com pull-to-refresh padronizado.
 * Usa as cores do app para o indicador de refresh.
 *
 * Exemplo:
 * ```tsx
 * <RefreshableScrollView onRefresh={refetchData}>
 *   <Text>Conteúdo</Text>
 * </RefreshableScrollView>
 * ```
 */
export function RefreshableScrollView({
  onRefresh,
  children,
  ...rest
}: RefreshableScrollViewProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <ScrollView
      {...rest}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.brown[800]]}
          tintColor={colors.brown[800]}
        />
      }
    >
      {children}
    </ScrollView>
  );
}
