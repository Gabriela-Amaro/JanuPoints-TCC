import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ClipboardList } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Carousel } from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackButton } from "../../components/Buttons/Back";
import { colors } from "../../constants/Colors";
import { api, BASE_URL } from "../../services/api";
import type { Estabelecimento, Produto } from "../../types";
import { styles } from "../../styles/screens/estabelecimento/styles";



const SCREEN_WIDTH = Dimensions.get("window").width;



function ProductCard({ produto }: { produto: Produto }) {
  const router = useRouter();
  const imageUrl = produto.imagem
    ? produto.imagem.startsWith("http")
      ? produto.imagem
      : `${BASE_URL}${produto.imagem}`
    : null;

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/produto/${produto.id}`)}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{produto.nome}</Text>
        {produto.descricao ? (
          <Text style={styles.productDesc} numberOfLines={2}>
            {produto.descricao}
          </Text>
        ) : null}
        <Text style={styles.productPoints}>{produto.pontos} pontos</Text>
      </View>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImage, styles.productImagePlaceholder]}>
          <Text style={{ color: colors.gray[500], fontSize: 12 }}>Sem foto</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function EstabelecimentoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [estabelecimento, setEstabelecimento] = useState<Estabelecimento | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [loading, setLoading] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handlePontuar = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de permissão para acessar sua câmera para tirar foto da nota fiscal."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCapturedImage(result.assets[0].uri);
        setShowPreview(true);
      }
    } catch (err) {
      console.error("Erro ao abrir a câmera:", err);
      Alert.alert("Erro", "Não foi possível abrir a câmera.");
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const est = await api.get<Estabelecimento>(`/api/estabelecimentos/${id}/`);
      setEstabelecimento(est);

      const prodsResult = await Promise.allSettled([
        api.get<Produto[]>(`/api/produtos/?estabelecimento=${id}`),
      ]).then(([result]) => result);

      if (prodsResult.status === "fulfilled") {
        setProdutos(prodsResult.value);
      }

    } catch (err) {
      console.error("Erro ao buscar estabelecimento:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.brown[800]} />
      </View>
    );
  }

  if (!estabelecimento) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={styles.emptyText}>Estabelecimento não encontrado.</Text>
      </View>
    );
  }

  const logoUrl = estabelecimento.logotipo
    ? estabelecimento.logotipo.startsWith("http")
      ? estabelecimento.logotipo
      : `${BASE_URL}${estabelecimento.logotipo}`
    : null;

  const bannerHeight = 200;

  // Imagens das recompensas (produtos) para o carrossel do banner
  const productImages: string[] = produtos
    .filter((p): p is Produto & { imagem: string } => Boolean(p.imagem && p.imagem.trim() !== ""))
    .map((p) => (p.imagem.startsWith("http") ? p.imagem : `${BASE_URL}${p.imagem}`));

  const bannerImages: string[] = productImages;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Banner — carrossel de fotos das recompensas/produtos */}
        <View style={[styles.bannerContainer, { height: bannerHeight }]}>
          {bannerImages.length > 0 ? (
            <Carousel
              loop
              autoplay={bannerImages.length > 1}
              autoplayInterval={3000}
              data={bannerImages}
              style={{ width: SCREEN_WIDTH, height: bannerHeight }}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={{ width: SCREEN_WIDTH, height: bannerHeight }}
                  resizeMode="cover"
                />
              )}
            />
          ) : null}
          <BackButton />
        </View>

        {/* Conteúdo principal */}
        <View style={styles.contentContainer}>
          {/* Logo circular */}
          <View style={styles.logoWrapper}>
            {logoUrl ? (
              <Image source={{ uri: logoUrl }} style={styles.logo} />
            ) : (
              <View style={[styles.logo, styles.logoPlaceholder]}>
                <Text style={styles.logoText}>
                  {estabelecimento.nome.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Informações */}
          <View style={styles.infoSection}>
            <Text style={styles.name}>{estabelecimento.nome}</Text>

            {estabelecimento.descricao ? (
              <Text style={styles.description}>
                {estabelecimento.descricao}
              </Text>
            ) : null}
          </View>

          {/* Recompensas */}
          <View style={styles.productsHeader}>
            <Text style={styles.productsTitle}>Recompensas disponíveis</Text>
          </View>

          {produtos.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum produto disponível.</Text>
          ) : (
            produtos.map((p) => <ProductCard key={p.id} produto={p} />)
          )}

          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/* Envio de nota fiscal */}
      <TouchableOpacity style={styles.pontuarBtn} onPress={handlePontuar}>
        <ClipboardList size={18} color={colors.white} />
        <Text style={styles.pontuarText}>Enviar nota fiscal</Text>
      </TouchableOpacity>

      {/* Modal de Revisão da Foto */}
      <Modal
        visible={showPreview}
        animationType="slide"
        onRequestClose={() => setShowPreview(false)}
      >
        <View style={[styles.previewModalContainer, { paddingTop: insets.top }]}>
          {/* Header */}
          <View style={styles.previewHeader}>
            <Text style={styles.previewHeaderTitle}>Revisar Foto</Text>
          </View>

          {/* Imagem */}
          <View style={styles.previewImageContainer}>
            {capturedImage && (
              <Image
                source={{ uri: capturedImage }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
          </View>

          {/* Footer */}
          <View style={[styles.previewFooter, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <TouchableOpacity
              style={styles.btnRetake}
              onPress={handlePontuar}
            >
              <Text style={styles.btnRetakeText}>Tirar novamente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnAccept}
              onPress={() => {
                setShowPreview(false);
                router.push({
                  pathname: "/ticket/acumulo/criar",
                  params: {
                    imageUri: capturedImage || "",
                    establishmentId: id,
                    establishmentName: estabelecimento.nome,
                  },
                });
              }}
            >
              <Text style={styles.btnAcceptText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


    </View>
  );
}
