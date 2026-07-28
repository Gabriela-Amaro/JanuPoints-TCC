import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { colors } from "../../constants/Colors";
import { FontFamily, FontSize } from "../../constants/Fonts";
import { ApiError } from "../../services/api";

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { showError } = useToast();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      showError("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)/home");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          showError("Email ou senha incorretos.");
        } else {
          showError(`Erro do servidor (${err.status}): ${JSON.stringify(err.data)}`);
        }
      } else if (err instanceof TypeError) {
        showError(
          "Não foi possível conectar ao servidor. Verifique a conexão de rede."
        );
      } else {
        showError("Não foi possível fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Título */}
        <View style={styles.header}>
          <Text style={styles.appName}>Janu Prime</Text>
          <Text style={styles.subtitle}>Entre na sua conta</Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor={colors.brown[400]}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.brown[400]}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Link para cadastro */}
        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => router.push("/(auth)/register")}
        >
          <Text style={styles.registerText}>
            Não tem conta?{" "}
            <Text style={styles.registerTextBold}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// =============================================================
// Estilos
// =============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 48,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  appName: {
    fontSize: 32,
    fontFamily: FontFamily.bold,
    color: colors.brown[800],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.regular,
    color: colors.gray[700],
  },
  form: {
    gap: 4,
  },
  label: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.medium,
    color: colors.textPrimary,
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.brown[400],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: FontSize.body,
    fontFamily: FontFamily.regular,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundSecondary,
  },
  button: {
    backgroundColor: colors.brown[800],
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: FontSize.body,
    fontFamily: FontFamily.bold,
  },
  registerLink: {
    marginTop: 24,
    alignItems: "center",
  },
  registerText: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.regular,
    color: colors.gray[700],
  },
  registerTextBold: {
    fontFamily: FontFamily.bold,
    color: colors.brown[800],
  },
});
