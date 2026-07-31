import { StyleSheet } from "react-native";
import { colors } from "../../../constants/Colors";
import { FontFamily, FontSize } from "../../../constants/Fonts";

export const styles = StyleSheet.create({
  eyebrow: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.medium,
    color: colors.brown[800],
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: FontSize.title,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brown[800],
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    marginLeft: 14,
    flex: 1,
  },
  name: {
    fontSize: FontSize.subtitle,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
  },
  email: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.regular,
    color: colors.gray[700],
    marginTop: 3,
  },
  pointsCard: {
    backgroundColor: colors.brown[800],
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  pointsLabel: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.medium,
    color: colors.brown[100],
  },
  pointsValue: {
    fontSize: 28,
    fontFamily: FontFamily.bold,
    color: colors.white,
    marginTop: 8,
  },
  pointsHelper: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.regular,
    color: colors.brown[100],
    lineHeight: 18,
    marginTop: 10,
  },
  accountActions: {
    gap: 10,
    marginBottom: 24,
  },
  accountAction: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 62,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brown[100],
  },
  actionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
  },
  actionDescription: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.regular,
    color: colors.gray[700],
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.errorDark,
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    gap: 8,
  },
  logoutText: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.bold,
    color: colors.errorDark,
  },
});
