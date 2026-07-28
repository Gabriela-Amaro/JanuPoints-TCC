import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { ProfileHeader } from "../../components/ProfileHeader";
import { AccountField } from "../../components/AccountField";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { api, ApiError, formatErrorMessage } from "../../services/api";
import { maskCpf, maskPhone } from "../../utils/masks";
import { styles } from "./styles";

export default function ContaScreen() {
  const { user, refreshUser } = useAuth();
  const { showError, showSuccess } = useToast();

  const [nome, setNome] = useState(user?.nome ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [telefone, setTelefone] = useState(
    user?.telefone ? maskPhone(user.telefone) : "+55 "
  );
  const [loadingField, setLoadingField] = useState<
    "nome" | "email" | "telefone" | null
  >(null);

  // Comparações de estado
  const isNomeModified = nome.trim() !== (user?.nome ?? "").trim();
  const isEmailModified = email.trim() !== (user?.email ?? "").trim();

  const cleanTelefoneState = telefone.replace(/\D/g, "");
  const cleanTelefoneOriginal = (user?.telefone ?? "").replace(/\D/g, "");
  const isTelefoneModified = cleanTelefoneState !== cleanTelefoneOriginal;

  async function handleSaveField(
    fieldName: "nome" | "email" | "telefone",
    value: string
  ) {
    if (!user?.id) return;

    if (fieldName === "email" && (!value.includes("@") || !value.includes("."))) {
      showError("Por favor, digite um e-mail válido.");
      return;
    }

    setLoadingField(fieldName);
    try {
      let payloadValue = value.trim();
      if (fieldName === "telefone") {
        const digits = value.replace(/\D/g, "");
        payloadValue = digits.startsWith("55") ? `+${digits}` : `+55${digits}`;
      }

      await api.patch(`/api/clientes/${user.id}/`, { [fieldName]: payloadValue });
      await refreshUser();
      showSuccess("Campo atualizado com sucesso.");
    } catch (err: any) {
      const message = formatErrorMessage(
        err,
        "Não foi possível atualizar o campo. Tente novamente."
      );
      showError(message);
    } finally {
      setLoadingField(null);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Cabeçalho exclusivo para sub-páginas do Perfil */}
      <ProfileHeader title="Conta" />

      {/* Conteúdo principal */}
      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Nome */}
          <AccountField
            label="Nome"
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome completo"
            autoCapitalize="words"
            isModified={isNomeModified}
            isLoading={loadingField === "nome"}
            onSave={() => handleSaveField("nome", nome)}
          />

          {/* Email */}
          <AccountField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            isModified={isEmailModified}
            isLoading={loadingField === "email"}
            onSave={() => handleSaveField("email", email)}
          />

          {/* CPF (Não Editável) */}
          <AccountField
            label="CPF"
            value={user?.cpf ? maskCpf(user.cpf) : ""}
            editable={false}
          />

          {/* Telefone */}
          <AccountField
            label="Telefone"
            value={telefone}
            onChangeText={(text) => setTelefone(maskPhone(text))}
            placeholder="+55 (00) 00000-0000"
            keyboardType="phone-pad"
            maxLength={19}
            isModified={isTelefoneModified}
            isLoading={loadingField === "telefone"}
            onSave={() => handleSaveField("telefone", telefone)}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
