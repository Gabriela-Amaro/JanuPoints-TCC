import { StyleSheet } from "react-native";
import { colors } from "../../constants/Colors";
import { FontFamily, FontSize } from "../../constants/Fonts";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 16,
    backgroundColor: colors.brown[100],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: FontSize.subtitle,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
  },
  rightContainer: {
    alignItems: "flex-end",
  },
  placeholderRight: {
    width: 40,
    height: 40,
  },
});
