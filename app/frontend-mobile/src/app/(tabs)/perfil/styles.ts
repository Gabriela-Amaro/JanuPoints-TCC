import { StyleSheet } from "react-native";
import { colors } from "../../../constants/Colors";
import { FontFamily, FontSize } from "../../../constants/Fonts";

export const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  headerTitle: {
    fontSize: FontSize.title,
    fontFamily: FontFamily.medium,
    color: colors.black[900],
  },
  bellButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  menuList: {
    flex: 1,
    gap: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.medium,
    color: colors.textPrimary,
  },
  menuTextLogout: {
    color: colors.error,
  },
});
