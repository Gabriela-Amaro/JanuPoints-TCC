
import { StyleSheet } from "react-native";
import { colors } from "../../../constants/Colors";
import { FontFamily, FontSize } from "../../../constants/Fonts";

export const styles = StyleSheet.create({
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  greeting: {
    fontSize: FontSize.title,
    fontFamily: FontFamily.medium,
    color: colors.black[900],
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: FontSize.subtitle,
    fontFamily: FontFamily.medium,
    color: colors.gray[700],
    paddingLeft: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  // lojas
  storeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
  },
  storeLogo: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  storeLogoPlaceholder: {
    backgroundColor: colors.brown[400],
    justifyContent: "center",
    alignItems: "center",
  },
  storeLogoText: {
    fontSize: FontSize.subtitle,
    fontFamily: FontFamily.bold,
    color: colors.white,
  },
  storeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  storeName: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.medium,
    color: colors.textPrimary,
  },
  storeDescription: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.regular,
    color: colors.gray[700],
    marginTop: 2,
  },
  emptyText: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.regular,
    color: colors.gray[700],
    textAlign: "center",
    marginTop: 24,
  },
});