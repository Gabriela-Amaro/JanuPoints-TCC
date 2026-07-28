import React, { useCallback, useState } from "react";
import { FlatList, FlatListProps, RefreshControl } from "react-native";
import { colors } from "../../constants/Colors";

interface RefreshableFlatListProps<T> extends FlatListProps<T> {
  /** Função async chamada ao puxar para baixo */
  onRefresh: () => Promise<void> | void;
}

/**
 * FlatList com pull-to-refresh padronizado.
 * Usa as cores do app para o indicador de refresh.
 *
 * Exemplo:
 * ```tsx
 * <RefreshableFlatList
 *   data={items}
 *   renderItem={({ item }) => <Card item={item} />}
 *   onRefresh={refetchData}
 * />
 * ```
 */
export function RefreshableFlatList<T>({
  onRefresh,
  ...rest
}: RefreshableFlatListProps<T>) {
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
    <FlatList
      {...rest}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.brown[800]]}
          tintColor={colors.brown[800]}
        />
      }
    />
  );
}
