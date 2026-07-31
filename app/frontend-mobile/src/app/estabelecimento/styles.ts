import { StyleSheet } from "react-native";
import { colors } from "../../constants/Colors";
import { FontFamily, FontSize } from "../../constants/Fonts";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  // Banner de imagem de fundo
  bannerContainer: {
    // height: 200,
    backgroundColor: colors.brown[100],
  },
  contentContainer: {
    backgroundColor: colors.backgroundPrimary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -28,
    paddingTop: 0,
    flex: 1,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 48,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  // Logo circular sobrepondo o banner
  logoWrapper: {
    alignItems: "center",
    marginTop: -45,
    zIndex: 5,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: colors.backgroundPrimary,
  },
  logoPlaceholder: {
    backgroundColor: colors.brown[400],
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 32,
    fontFamily: FontFamily.bold,
    color: colors.white,
  },
  // Info principal
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  name: {
    fontSize: 22,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.regular,
    color: colors.gray[700],
    lineHeight: 20,
    marginTop: 4,
  },

  // Seção Produtos
  productsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  productsTitle: {
    fontSize: FontSize.title,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
  },
  // Card do produto
  productCard: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.separator,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.medium,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  productDesc: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.regular,
    color: colors.gray[700],
    marginBottom: 6,
  },
  productPoints: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.bold,
    color: colors.brown[800],
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  productImagePlaceholder: {
    backgroundColor: colors.brown[100],
    justifyContent: "center",
    alignItems: "center",
  },
  // Botão Pontuar
  pontuarBtn: {
    position: "absolute",
    bottom: 24,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.brown[800],
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 4,
    shadowColor: colors.black[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  pontuarText: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.bold,
    color: colors.white,
  },
  emptyText: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.regular,
    color: colors.gray[700],
    textAlign: "center",
    marginTop: 40,
  },
  // Modal de visualização de foto
  previewModalContainer: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  previewHeaderTitle: {
    textAlign: "center",
    flex: 1,
    fontSize: FontSize.subtitle,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
  },
  previewImageContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  previewFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
  },
  btnRetake: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundPrimary,
  },
  btnRetakeText: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.medium,
    color: colors.textPrimary,
  },
  btnAccept: {
    flex: 1,
    backgroundColor: colors.brown[800],
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnAcceptText: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.bold,
    color: colors.white,
  },

});
