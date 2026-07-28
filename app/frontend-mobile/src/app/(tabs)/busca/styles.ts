import { StyleSheet } from "react-native";
import { colors } from "../../../constants/Colors";
import { FontFamily, FontSize } from "../../../constants/Fonts";

export const styles = StyleSheet.create({
  headerTitle: {
    fontSize: FontSize.title,
    fontFamily: FontFamily.medium,
    color: colors.black[900],
  },
  content: {
    flex: 1,
    padding: 16,
  },
  // --- Busca ---
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brown[800],
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 0,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.description,
    fontFamily: FontFamily.regular,
    color: colors.white,
  },
  // --- Cards ---
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
  storeAddress: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.regular,
    color: colors.textSecondary,
    marginTop: 2,
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
    marginTop: 40,
  },
  switchSearchContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: 8,
    marginBottom: 12,
    marginTop: 4,
    borderRadius: 20,
    padding: 4,
    height: 40,
  },
  switchSearchContent: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  switchSearchText: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.regular,
    color: colors.textSecondary
  },
  switchSearchActivated: {
    backgroundColor: colors.backgroundPrimary,
  },
});