import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
} from "react-native";
import { CarrosselImagens } from "../../../components/CarrosselImagens";
import { EstabelecimentoCard } from "../../../components/EstabelecimentoCard";
import { PointsBadge } from "../../../components/PointsBadge";
import { ScreenContainer } from "../../../components/ScreenContainer/tabs/ScreenContainer";
import { RefreshableScrollView } from "../../../components/RefreshableScrollView";
import { useAuth } from "../../../contexts/AuthContext";
import { useAnuncios } from "../../../hooks/useAnuncios";
import { useEstabelecimentos } from "../../../hooks/useEstabelecimentos";
import { colors } from "../../../constants/Colors";
import { styles } from "./styles";

export default function Home() {
  const { user } = useAuth();
  const { imageUrls, loading: loadingAnuncios, refetch: refetchAnuncios } = useAnuncios();
  const { data: estabelecimentos, loading: loadingEstabelecimentos, refetch: refetchEstabelecimentos } =
    useEstabelecimentos();

  const onRefresh = useCallback(async () => {
    await Promise.all([refetchAnuncios(), refetchEstabelecimentos()]);
  }, [refetchAnuncios, refetchEstabelecimentos]);

  const firstName = user?.nome?.split(" ")[0] ?? "Usuário";

  return (
    <ScreenContainer
      headerContent={
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Olá, {firstName}!</Text>
          <PointsBadge points={user?.pontos ?? 0} />
        </View>
      }
    >
      <RefreshableScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onRefresh={onRefresh}
      >
        {/* Seção de Ofertas (só aparece quando há anúncios) */}
        {loadingAnuncios ? (
          <ActivityIndicator
            size="large"
            color={colors.brown[800]}
            style={{ marginVertical: 40 }}
          />
        ) : imageUrls.length > 0 ? (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Ofertas</Text>
            <CarrosselImagens data={imageUrls} />
          </>
        ) : null}

        {/* Seção de Lojas */}
        <Text style={styles.sectionTitle}>Lojas</Text>
        {loadingEstabelecimentos ? (
          <ActivityIndicator
            size="large"
            color={colors.brown[800]}
            style={{ marginVertical: 40 }}
          />
        ) : estabelecimentos.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum estabelecimento encontrado.</Text>
        ) : (
          <FlatList
            data={estabelecimentos}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <EstabelecimentoCard estabelecimento={item} />}
            scrollEnabled={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          />
        )}
      </RefreshableScrollView>
    </ScreenContainer>
  );
}