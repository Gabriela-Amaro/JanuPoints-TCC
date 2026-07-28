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
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
    width: "100%",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.brown[400],
    borderRadius: 10,
    paddingLeft: 14,
    paddingRight: 44,
    fontSize: FontSize.body,
    fontFamily: FontFamily.regular,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  saveButton: {
    backgroundColor: colors.brown[800],
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: FontSize.body,
    fontFamily: FontFamily.bold,
  },
});
