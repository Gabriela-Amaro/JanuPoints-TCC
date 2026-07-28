import { StyleSheet } from "react-native";
import { colors } from "../../../constants/Colors";
import { FontFamily, FontSize } from "../../../constants/Fonts";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  backButton: {
    backgroundColor: "transparent",
    marginLeft: -4,
    marginTop: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 30,
  },
  storeName: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.medium,
    color: colors.textPrimary,
  },
  ratingStars: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingCount: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.regular,
    color: colors.gray[500],
    marginLeft: 4,
  },
  storeLogo: {
    width: 60,
    height: 60,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 99,
    backgroundColor: colors.brown[400],
    justifyContent: "center",
    alignItems: "center",
  },
  logoPlaceholderText: {
    color: colors.white,
    fontSize: 20,
    fontFamily: FontFamily.bold,
  },
  productCard: {
    flexDirection: "row",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  productImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: colors.brown[100],
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: colors.gray[500],
    fontSize: FontSize.small,
    fontFamily: FontFamily.regular,
  },
  productDetails: {
    flex: 1,
    marginLeft: 16,
  },
  productName: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  productDesc: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.regular,
    color: colors.gray[700],
    lineHeight: 16,
    marginBottom: 6,
  },
  quantityText: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.regular,
    color: colors.gray[500],
  },
  valuesSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: FontSize.subtitle,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  valueLabel: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.regular,
    color: colors.gray[700],
  },
  valueAmount: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.regular,
    color: colors.textPrimary,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
  },
  totalAmount: {
    fontSize: FontSize.subtitle,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
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
