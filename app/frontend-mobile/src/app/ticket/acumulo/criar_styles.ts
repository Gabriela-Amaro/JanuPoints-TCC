import { StyleSheet } from "react-native";
import { colors } from "../../../constants/Colors";
import { FontFamily, FontSize } from "../../../constants/Fonts";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.separator,
    width: "100%",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  // Card da imagem capturada
  imageCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brown[100],
    borderRadius: 12,
    padding: 8,
    marginBottom: 20,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
  },
  imageDetails: {
    marginLeft: 16,
    flex: 1,
  },
  imageTitle: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
  },
  imageSubtitle: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.regular,
    color: colors.gray[700],
    marginTop: 2,
  },
  // Formulário
  formSection: {
    flex: 1,
  },
  formTitleCentred: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  inputLabel: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.bold,
    color: colors.gray[700],
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E6DED8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: FontSize.body,
    fontFamily: FontFamily.regular,
    color: colors.textPrimary,
    backgroundColor: colors.white,
    minHeight: 48,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.backgroundPrimary,
  },
  submitButton: {
    backgroundColor: colors.orange,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  submitButtonText: {
    color: colors.white,
    fontSize: FontSize.body,
    fontFamily: FontFamily.bold,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[500],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundPrimary,
  },
  // Modal de imagem em tela cheia (Fullscreen preview)
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenCloseArea: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenContainer: {
    width: "100%",
    height: "100%",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  fullscreenImage: {
    width: "100%",
    height: "80%",
  },
  fullscreenCloseBtn: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  fullscreenCloseBtnText: {
    color: colors.white,
    fontSize: FontSize.body,
    fontFamily: FontFamily.bold,
  },
});
