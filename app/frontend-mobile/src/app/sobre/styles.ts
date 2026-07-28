import { StyleSheet } from "react-native";
import { colors } from "../../constants/Colors";
import { FontFamily, FontSize } from "../../constants/Fonts";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brown[100],
  },
  content: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  aboutText: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.regular,
    color: colors.textPrimary,
    lineHeight: 24,
  },
});
