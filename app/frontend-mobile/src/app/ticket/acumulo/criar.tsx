import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EstablishmentHeader } from "../../../components/TicketDetail/EstablishmentHeader";
import { TicketHeader } from "../../../components/TicketDetail/TicketHeader";
import { colors } from "../../../constants/Colors";
import { api, ApiError, BASE_URL } from "../../../services/api";
import type { Estabelecimento } from "../../../types";
import { styles } from "./criar_styles";

// Helper formatador de data DD/MM/AAAA
function formatDateInput(text: string): string {
  const cleaned = text.replace(/\D/g, "");
  let formatted = cleaned;
  if (cleaned.length > 2) {
    formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
  }
  if (cleaned.length > 4) {
    formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}/${cleaned.substring(4, 8)}`;
  }
  return formatted.substring(0, 10);
}

// Helper formatador de preço (permite apenas números e uma vírgula/ponto)
function formatPriceInput(text: string): string {
  let cleaned = text.replace(/[^0-9.,]/g, "");
  
  const countSeparators = (cleaned.match(/[.,]/g) || []).length;
  if (countSeparators > 1) {
    let foundSeparator = false;
    cleaned = cleaned.split("").filter((char) => {
      if (char === "." || char === ",") {
        if (!foundSeparator) {
          foundSeparator = true;
          return true;
        }
        return false;
      }
      return true;
    }).join("");
  }
  return cleaned;
}

export default function CriarTicketAcumuloScreen() {
  const { imageUri, establishmentId, establishmentName } = useLocalSearchParams<{
    imageUri: string;
    establishmentId: string;
    establishmentName: string;
  }>();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [establishment, setEstablishment] = useState<Estabelecimento | null>(null);
  const [loadingEst, setLoadingEst] = useState(true);

  const [preco, setPreco] = useState("");
  const [numeroNota, setNumeroNota] = useState("");
  const [dataNota, setDataNota] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  // Carregar dados completos do estabelecimento
  useEffect(() => {
    async function loadEstablishment() {
      if (!establishmentId) {
        setLoadingEst(false);
        return;
      }
      try {
        const est = await api.get<Estabelecimento>(`/api/estabelecimentos/${establishmentId}/`);
        setEstablishment(est);
      } catch (err) {
        console.error("Erro ao carregar dados do estabelecimento:", err);
      } finally {
        setLoadingEst(false);
      }
    }
    loadEstablishment();
  }, [establishmentId]);

  const handleEnviar = async () => {
    if (!preco.trim()) {
      Alert.alert("Erro", "Por favor, digite o valor da nota fiscal.");
      return;
    }
    if (!numeroNota.trim()) {
      Alert.alert("Erro", "Por favor, digite o número da nota fiscal.");
      return;
    }
    if (!dataNota.trim() || dataNota.length < 10) {
      Alert.alert("Erro", "Por favor, digite uma data de emissão válida (DD/MM/AAAA).");
      return;
    }
    if (!imageUri) {
      Alert.alert("Erro", "Imagem da nota fiscal não encontrada.");
      return;
    }

    const cleanPreco = preco.replace(",", ".");
    const precoNum = parseFloat(cleanPreco);
    if (isNaN(precoNum) || precoNum <= 0) {
      Alert.alert("Erro", "Por favor, digite um valor de nota válido e maior que zero.");
      return;
    }

    const parts = dataNota.split("/");
    const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("estabelecimento", establishmentId || "");
      formData.append("preco", cleanPreco);
      formData.append("numero_nota", numeroNota);
      formData.append("data_nota", isoDate);
      formData.append("imagem", {
        uri: imageUri,
        name: "nota_fiscal.jpg",
        type: "image/jpeg",
      } as any);

      const response = await api.post<{ id: number }>("/api/tickets/credito/", formData);

      Alert.alert("Sucesso", "Nota fiscal enviada com sucesso!", [
        {
          text: "OK",
          onPress: () => {
            router.replace("/(tabs)/transacoes");
            router.push(`/ticket/acumulo/${response.id}`);
          },
        },
      ]);
    } catch (err: any) {
      console.error("Erro ao enviar nota fiscal:", err);
      let message = "Ocorreu um erro ao enviar a nota fiscal.";
      if (err instanceof ApiError && err.data) {
        if (err.data.error) {
          message = String(err.data.error);
        } else if (err.data.detail) {
          message = String(err.data.detail);
        } else {
          const keys = Object.keys(err.data);
          if (keys.length > 0) {
            const firstVal = err.data[keys[0]];
            message = Array.isArray(firstVal) ? String(firstVal[0]) : String(firstVal);
          }
        }
      }
      Alert.alert("Erro", message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEst) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brown[800]} />
      </View>
    );
  }

  const logoUrl = establishment?.logotipo
    ? establishment.logotipo.startsWith("http")
      ? establishment.logotipo
      : `${BASE_URL}${establishment.logotipo}`
    : null;

  const storeName = establishment?.nome || establishmentName || "Estabelecimento";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header Topo */}
        <TicketHeader title="Pontuar" />

        {/* Detalhes do Estabelecimento */}
        <EstablishmentHeader
          name={storeName}
          logoUrl={logoUrl}
          mediaAvaliacoes={establishment?.media_avaliacoes ?? 0}
          totalAvaliacoes={establishment?.total_avaliacoes ?? 0}
        />

        {/* Divisor de Seção */}
        <View style={styles.sectionDivider} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Card da Imagem Capturada */}
          <TouchableOpacity
            style={styles.imageCard}
            onPress={() => setShowFullscreen(true)}
            activeOpacity={0.85}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.previewImage} />
            )}
            <View style={styles.imageDetails}>
              <Text style={styles.imageTitle}>Nota Fiscal Capturada</Text>
              <Text style={styles.imageSubtitle}>Toque para ver a imagem completa</Text>
            </View>
          </TouchableOpacity>

          {/* Formulário */}
          <View style={styles.formSection}>
            <Text style={styles.formTitleCentred}>Dados da Nota Fiscal</Text>

            {/* Campo Valor */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Valor</Text>
              <TextInput
                style={styles.input}
                placeholder="R$ 0,00"
                placeholderTextColor={colors.gray[500]}
                keyboardType="numeric"
                value={preco}
                onChangeText={(text) => setPreco(formatPriceInput(text))}
                editable={!submitting}
              />
            </View>

            {/* Campo Número/Código da Nota */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Código</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 8907"
                placeholderTextColor={colors.gray[500]}
                keyboardType="numeric"
                value={numeroNota}
                onChangeText={(text) => setNumeroNota(text.replace(/\D/g, ""))}
                editable={!submitting}
              />
            </View>

            {/* Campo Data de Emissão */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Data de Emissão</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={colors.gray[500]}
                keyboardType="numeric"
                value={dataNota}
                onChangeText={(text) => setDataNota(formatDateInput(text))}
                maxLength={10}
                editable={!submitting}
              />
            </View>
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleEnviar}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Confirmar Envio</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Modal da Imagem em Tela Cheia */}
        <Modal
          visible={showFullscreen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFullscreen(false)}
        >
          <View style={styles.fullscreenOverlay}>
            <TouchableOpacity
              style={styles.fullscreenCloseArea}
              onPress={() => setShowFullscreen(false)}
              activeOpacity={1}
            >
              <View style={styles.fullscreenContainer}>
                {imageUri && (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.fullscreenImage}
                    resizeMode="contain"
                  />
                )}
                <TouchableOpacity
                  style={styles.fullscreenCloseBtn}
                  onPress={() => setShowFullscreen(false)}
                >
                  <Text style={styles.fullscreenCloseBtnText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}
