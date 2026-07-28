import { StyleSheet } from "react-native";
import { colors } from "../../constants/Colors";
import { FontFamily, FontSize } from "../../constants/Fonts";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  bannerContainer: {
    position: "relative",
    backgroundColor: colors.brown[100],
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.brown[400],
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: colors.white,
    fontSize: FontSize.body,
    fontFamily: FontFamily.medium,
  },
  establishmentBadge: {
    position: "absolute",
    bottom: 36,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 20,
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 8,
    zIndex: 10,
    gap: 6,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.1)",
  },
  establishmentLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  logoPlaceholder: {
    backgroundColor: colors.brown[400],
    justifyContent: "center",
    alignItems: "center",
  },
  logoPlaceholderText: {
    color: colors.white,
    fontSize: 10,
    fontFamily: FontFamily.bold,
  },
  establishmentName: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
  },
  contentContainer: {
    backgroundColor: colors.backgroundPrimary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
    flex: 1,
  },
  productName: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  productDesc: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  productPoints: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
  },
  footer: {
    backgroundColor: colors.backgroundPrimary,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  footerLeft: {
    flexDirection: "column",
  },
  footerTotalLabel: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.regular,
    color: colors.gray[500],
    marginBottom: 2,
  },
  footerTotalValue: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
  },
  footerButton: {
    backgroundColor: colors.orange,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  footerButtonText: {
    color: colors.white,
    fontSize: FontSize.body,
    fontFamily: FontFamily.bold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundPrimary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.backgroundPrimary,
  },
  errorText: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.regular,
    color: colors.errorDark,
    textAlign: "center",
    marginBottom: 16,
  },
});
