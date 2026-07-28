import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { ProfileHeader } from "../../components/ProfileHeader";
import { useToast } from "../../contexts/ToastContext";
import { api, ApiError, formatErrorMessage } from "../../services/api";
import { colors } from "../../constants/Colors";
import { styles } from "./styles";

export default function SegurancaScreen() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPassword2, setShowNewPassword2] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSavePassword() {
    if (!oldPassword || !newPassword || !newPassword2) {
      showError("Preencha todos os campos para alterar a senha.");
      return;
    }

    if (newPassword !== newPassword2) {
      showError("A nova senha e a confirmação não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await api.put("/api/usuarios/change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword2,
      });

      showSuccess("Senha alterada com sucesso!");
      setOldPassword("");
      setNewPassword("");
      setNewPassword2("");
      router.back();
    } catch (err: any) {
      const message = formatErrorMessage(
        err,
        "Não foi possível alterar a senha. Tente novamente."
      );
      showError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Cabeçalho exclusivo para sub-páginas do Perfil */}
      <ProfileHeader title="Segurança" />

      {/* Conteúdo principal */}
      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Senha Atual */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Senha Atual</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry={!showOldPassword}
                placeholderTextColor={colors.gray[500]}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowOldPassword(!showOldPassword)}
                activeOpacity={0.7}
              >
                {showOldPassword ? (
                  <EyeOff size={20} color={colors.gray[500]} />
                ) : (
                  <Eye size={20} color={colors.gray[500]} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Nova Senha */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Nova Senha</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                placeholderTextColor={colors.gray[500]}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
                activeOpacity={0.7}
              >
                {showNewPassword ? (
                  <EyeOff size={20} color={colors.gray[500]} />
                ) : (
                  <Eye size={20} color={colors.gray[500]} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirme a Senha */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Confirme a Senha</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={newPassword2}
                onChangeText={setNewPassword2}
                secureTextEntry={!showNewPassword2}
                placeholderTextColor={colors.gray[500]}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword2(!showNewPassword2)}
                activeOpacity={0.7}
              >
                {showNewPassword2 ? (
                  <EyeOff size={20} color={colors.gray[500]} />
                ) : (
                  <Eye size={20} color={colors.gray[500]} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSavePassword}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Salvar</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
