import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { colors } from "../constants/Colors";
import { useAuth } from "../contexts/AuthContext";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.backgroundPrimary,
        }}
      >
        <ActivityIndicator accessibilityLabel="Carregando sessão" color={colors.brown[800]} />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? "/(tabs)/home" : "/(auth)/login"} />;
}
