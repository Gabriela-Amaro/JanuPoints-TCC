import { StyleSheet } from "react-native";
import { colors } from "../../constants/Colors";
import { FontFamily, FontSize } from "../../constants/Fonts";

export const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 9999,
  },
  logoPlaceholder: {
    backgroundColor: colors.brown[400],
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: FontSize.subtitle,
    fontFamily: FontFamily.bold,
    color: colors.white,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.medium,
    color: colors.textPrimary,
  },
  // address: {
  //   fontSize: FontSize.small,
  //   fontFamily: FontFamily.regular,
  //   color: colors.textSecondary,
  //   marginTop: 2,
  // },
  description: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  between: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rating: {
    position: "absolute",
    top: 8,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.medium,
    color: colors.textPrimary,
  },
  noStarText: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.regular,
    color: colors.gray[700],
  }
});