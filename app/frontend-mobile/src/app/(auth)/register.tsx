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

export default function Register() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { showError } = useToast();
  const insets = useSafeAreaInsets();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("+55 ");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);

  // Máscara para CPF: 000.000.000-00
  function maskCpf(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  // Máscara para telefone: +55 (00) 00000-0000
  function maskPhone(value: string): string {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, "").slice(0, 13);

    // Garante que começa com 55
    if (digits.length <= 2) {
      return "+" + digits;
    }

    const country = digits.slice(0, 2);
    const rest = digits.slice(2);

    let formatted = `+${country} `;

    if (rest.length <= 2) {
      formatted += `(${rest}`;
    } else if (rest.length <= 7) {
      formatted += `(${rest.slice(0, 2)}) ${rest.slice(2)}`;
    } else {
      formatted += `(${rest.slice(0, 2)}) ${rest.slice(2, 7)}-${rest.slice(7, 11)}`;
    }

    return formatted;
  }

  async function handleRegister() {
    // Validação básica
    if (!nome || !email || !cpf || !telefone || !password || !password2) {
      showError("Preencha todos os campos.");
      return;
    }

    if (password !== password2) {
      showError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await signUp({ nome, email, cpf, telefone, password, password2 });
      router.replace("/(tabs)/home");
    } catch (err: any) {
      if (err instanceof TypeError) {
        showError(
          "Não foi possível conectar ao servidor. Verifique a conexão de rede."
        );
      } else if (err instanceof ApiError) {
        // Tenta extrair mensagem de erro do backend
        const errorData = err.data;
        let message = `Erro do servidor (${err.status}).`;

        if (errorData) {
          const firstKey = Object.keys(errorData)[0];
          const firstError = errorData[firstKey];
          if (Array.isArray(firstError)) {
            message = firstError[0];
          } else if (typeof firstError === "string") {
            message = firstError;
          }
        }

        showError(message);
      } else {
        showError("Não foi possível criar a conta. Tente novamente.");
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
        {/* Título */}
        <View style={styles.header}>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Preencha seus dados para começar</Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <Text style={styles.label}>Nome completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor={colors.brown[400]}
            value={nome}
            onChangeText={setNome}
          />

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

          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={styles.input}
            placeholder="000.000.000-00"
            placeholderTextColor={colors.brown[400]}
            keyboardType="numeric"
            maxLength={14}
            value={cpf}
            onChangeText={(text) => setCpf(maskCpf(text))}
          />

          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            placeholder="+55 (38) 99999-9999"
            placeholderTextColor={colors.brown[400]}
            keyboardType="phone-pad"
            maxLength={19}
            value={telefone}
            onChangeText={(text) => setTelefone(maskPhone(text))}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor={colors.brown[400]}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>Confirmar senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Repita a senha"
            placeholderTextColor={colors.brown[400]}
            secureTextEntry
            value={password2}
            onChangeText={setPassword2}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Criar conta</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Link para login */}
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.back()}
        >
          <Text style={styles.loginText}>
            Já tem conta?{" "}
            <Text style={styles.loginTextBold}>Entrar</Text>
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
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 48,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
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
  loginLink: {
    marginTop: 24,
    alignItems: "center",
  },
  loginText: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.regular,
    color: colors.gray[700],
  },
  loginTextBold: {
    fontFamily: FontFamily.bold,
    color: colors.brown[800],
  },
});
