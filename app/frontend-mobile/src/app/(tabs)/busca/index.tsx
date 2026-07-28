import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { EstabelecimentoCard } from "../../../components/EstabelecimentoCard";
import { ProdutoCard } from "../../../components/ProdutoCard/Busca";
import { ScreenContainer } from "../../../components/ScreenContainer/tabs/ScreenContainer";
import { RefreshableFlatList } from "../../../components/RefreshableFlatList";
import { styles } from "./styles";
import { colors } from "../../../constants/Colors";
import Icon from "../../../constants/icons";
import { useEstabelecimentos } from "../../../hooks/useEstabelecimentos";
import { useProdutos } from "../../../hooks/useProdutos";

type SearchMode = "lojas" | "produtos";

export default function Busca() {
  const [searchText, setSearchText] = useState("");
  const [mode, setMode] = useState<SearchMode>("lojas");

  const searchQuery = searchText.length >= 1 ? searchText : undefined;

  const { data: estabelecimentos, loading: loadingLojas, refetch: refetchLojas } =
    useEstabelecimentos(mode === "lojas" ? searchQuery : undefined);

  const { data: produtos, loading: loadingProdutos, refetch: refetchProdutos } =
    useProdutos(mode === "produtos" ? searchQuery : undefined);

  const loading = mode === "lojas" ? loadingLojas : loadingProdutos;

  const handleRefresh = useCallback(async () => {
    if (mode === "lojas") {
      await refetchLojas();
    } else {
      await refetchProdutos();
    }
  }, [mode, refetchLojas, refetchProdutos]);

  return (
    <ScreenContainer
      headerContent={
        <>
        {/* Campo de busca */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.white} />
          <TextInput
            style={styles.searchInput}
            placeholder="Procure por Lojas ou Produtos"
            placeholderTextColor={colors.white}
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        </>
      }
    >
      <View style={styles.content}>
        {/* Switch: Lojas / Produtos */}
        <View style={styles.switchSearchContainer}>
          <TouchableOpacity
            onPress={() => setMode("lojas")}
            style={[
              styles.switchSearchContent,
              mode === "lojas" && styles.switchSearchActivated,
            ]}
          >
            <Text
              style={[
                styles.switchSearchText,
                mode === "lojas" && { color: colors.textPrimary },
              ]}
            >
              Lojas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode("produtos")}
            style={[
              styles.switchSearchContent,
              mode === "produtos" && styles.switchSearchActivated,
            ]}
          >
            <Text
              style={[
                styles.switchSearchText,
                mode === "produtos" && { color: colors.textPrimary },
              ]}
            >
              Produtos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Resultados */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.brown[800]}
            style={{ marginTop: 40 }}
          />
        ) : mode === "lojas" ? (
          // === Lista de Lojas ===
          estabelecimentos.length === 0 ? (
            <Text style={styles.emptyText}>
              {searchText.length >= 1
                ? "Nenhum estabelecimento encontrado."
                : "Digite pelo menos 1 caractere para buscar."}
            </Text>
          ) : (
            <RefreshableFlatList
              key="lojas"
              data={estabelecimentos}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <EstabelecimentoCard estabelecimento={item} />
              )}
              contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
              onRefresh={handleRefresh}
            />
          )
        ) : (
          // === Grid de Produtos ===
          produtos.length === 0 ? (
            <Text style={styles.emptyText}>
              {searchText.length >= 1
                ? "Nenhum produto encontrado."
                : "Digite pelo menos 1 caractere para buscar."}
            </Text>
          ) : (
            <RefreshableFlatList
              key="produtos"
              data={produtos}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <ProdutoCard produto={item} />}
              numColumns={2}
              contentContainerStyle={{ paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
              onRefresh={handleRefresh}
            />
          )
        )}
      </View>
    </ScreenContainer>
  );
}
