// /src/app/_layout.tsx
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { ToastProvider } from "../contexts/ToastContext";

// Impede que a splash feche automaticamente
SplashScreen.preventAutoHideAsync();

/**
 * Componente interno que gerencia a navegação condicional
 * baseada no estado de autenticação.
 */
function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Ainda verificando token

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Não está logado e não está nas telas de auth → redireciona para login
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Está logado mas está nas telas de auth → redireciona para home
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Grupo de autenticação */}
      <Stack.Screen name="(auth)" />

      {/* Grupo das tabs (rota principal após login) */}
      <Stack.Screen name="(tabs)" />

      {/* Tela de detalhe do estabelecimento */}
      <Stack.Screen name="estabelecimento/[id]" />

      {/* Tela de detalhe do produto */}
      <Stack.Screen name="produto/[id]" />

      {/* Tela de confirmação do pedido */}
      <Stack.Screen name="produto/confirmar/[id]" />

      {/* Tela de acompanhamento do resgate */}
      <Stack.Screen name="ticket/resgate/[id]" />

      {/* Tela de acompanhamento do acúmulo */}
      <Stack.Screen name="ticket/acumulo/[id]" />

      {/* Tela de envio de nota fiscal (acúmulo) */}
      <Stack.Screen name="ticket/acumulo/criar" />
    </Stack>
  );
}

export default function RootLayout() {
  // Carregamento das fontes
  const [loaded] = useFonts({
    AppRegular: require("../../assets/fonts/roboto/Roboto-Regular.ttf"),
    AppMedium: require("../../assets/fonts/roboto/Roboto-Medium.ttf"),
    AppBold: require("../../assets/fonts/roboto/Roboto-Bold.ttf"),
  });

  // Esconde a splash quando as fontes carregam
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Não renderiza nada enquanto carrega
  if (!loaded) {
    return null;
  }

  // Renderização principal — AuthProvider e ToastProvider envolvem toda a navegação
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
