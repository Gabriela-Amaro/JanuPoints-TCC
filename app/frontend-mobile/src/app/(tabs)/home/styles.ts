import { StyleSheet } from "react-native";
import { colors } from "../../../constants/Colors";
import { FontFamily, FontSize } from "../../../constants/Fonts";

export const styles = StyleSheet.create({
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eyebrow: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.medium,
    color: colors.brown[800],
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  greeting: {
    fontSize: FontSize.title,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  introCard: {
    backgroundColor: colors.brown[100],
    borderRadius: 16,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: colors.brown[800],
  },
  introTitle: {
    fontSize: FontSize.subtitle,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  introText: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.regular,
    color: colors.gray[700],
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: FontSize.subtitle,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
    marginTop: 26,
    marginBottom: 14,
  },

  emptyText: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.regular,
    color: colors.gray[700],
    textAlign: "center",
    marginTop: 24,
  },
});
