import React, { useCallback } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { EstabelecimentoCard } from "../../../components/EstabelecimentoCard";
import { PointsBadge } from "../../../components/PointsBadge";
import { ScreenContainer } from "../../../components/ScreenContainer/tabs/ScreenContainer";
import { RefreshableScrollView } from "../../../components/RefreshableScrollView";
import { useAuth } from "../../../contexts/AuthContext";
import { useEstabelecimentos } from "../../../hooks/useEstabelecimentos";
import { colors } from "../../../constants/Colors";
import { styles } from "./styles";

/** Tela inicial do recorte acadêmico: saldo e estabelecimentos parceiros. */
export default function Home() {
  const { user } = useAuth();
  const {
    data: estabelecimentos,
    loading,
    refetch,
  } = useEstabelecimentos();

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const firstName = user?.nome?.split(" ")[0] ?? "Usuário";

  return (
    <ScreenContainer
      headerContent={
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.eyebrow}>JanuPoints</Text>
            <Text style={styles.greeting}>Olá, {firstName}!</Text>
          </View>
          <PointsBadge points={user?.pontos ?? 0} />
        </View>
      }
    >
      <RefreshableScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onRefresh={onRefresh}
      >
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Seu consumo vira benefício</Text>
          <Text style={styles.introText}>
            Escolha um estabelecimento, envie sua nota fiscal e acompanhe a
            aprovação dos pontos pelo painel parceiro.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Estabelecimentos parceiros</Text>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.brown[800]}
            style={{ marginVertical: 40 }}
          />
        ) : estabelecimentos.length === 0 ? (
          <Text style={styles.emptyText}>
            Nenhum estabelecimento disponível no momento.
          </Text>
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
