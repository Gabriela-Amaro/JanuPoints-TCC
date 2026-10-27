import React, { useCallback, useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { EstabelecimentoCard } from "../../../components/EstabelecimentoCard";
import { RefreshableFlatList } from "../../../components/RefreshableFlatList";
import { ScreenContainer } from "../../../components/ScreenContainer/tabs/ScreenContainer";
import { colors } from "../../../constants/Colors";
import Icon from "../../../constants/icons";
import { useEstabelecimentos } from "../../../hooks/useEstabelecimentos";
import { styles } from "../../../styles/screens/(tabs)/busca/styles";

/** Busca acadêmica limitada aos restaurantes parceiros. */
export default function Busca() {
  const [searchText, setSearchText] = useState("");
  const searchQuery = searchText.trim().length >= 1 ? searchText.trim() : undefined;
  const {
    data: estabelecimentos,
    loading,
    refetch,
  } = useEstabelecimentos(searchQuery);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <ScreenContainer
      headerContent={
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.brown[800]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar restaurante"
            placeholderTextColor={colors.gray[500]}
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>Buscar restaurantes</Text>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.brown[800]}
            style={{ marginTop: 40 }}
          />
        ) : searchQuery && estabelecimentos.length > 0 ? (
          <RefreshableFlatList
            data={estabelecimentos}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <EstabelecimentoCard estabelecimento={item} />
            )}
            contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            onRefresh={handleRefresh}
          />
        ) : (
          <Text style={styles.emptyText}>
            {searchQuery
              ? "Nenhum restaurante encontrado."
              : "Digite o nome de um restaurante para buscar."}
          </Text>
        )}
      </View>
    </ScreenContainer>
  );
}
