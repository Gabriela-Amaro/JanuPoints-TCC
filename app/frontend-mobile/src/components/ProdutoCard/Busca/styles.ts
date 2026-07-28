import { StyleSheet } from "react-native";
import { FontFamily, FontSize } from "../../../constants/Fonts";
import { colors } from "../../../constants/Colors";

export const styles = StyleSheet.create({
  card: {
    width: "48%",
    padding: 10,
    marginVertical: 8,
    marginRight: 13,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#d9d9d9"
  },
  image: {
    width: "100%",
    height: 110,
    borderRadius: 8,
  },
  imagePlaceholder: {
    backgroundColor: colors.brown[400],
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    fontSize: 28,
    fontFamily: FontFamily.bold,
    color: colors.white,
  },
  points: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
    marginTop: 8,
  },
  name: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.regular,
    color: colors.textPrimary,
    marginTop: 2,
  },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  storeLogo: {
    width: 24,
    height: 24,
    borderRadius: 99,
  },
  storeLogoPlaceholder: {
    backgroundColor: colors.brown[400],
    justifyContent: "center",
    alignItems: "center",
  },
  storeLogoText: {
    fontSize: 8,
    fontFamily: FontFamily.bold,
    color: colors.white,
  },
  storeName: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.medium,
    color: colors.textSecondary,
  },
  storeDetails: {
    flex: 1,
  },
  storeRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  storeRatingText: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.medium,
    color: colors.textPrimary,
  },
  storeRatingCount: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.regular,
    color: colors.gray[500],
  },
});