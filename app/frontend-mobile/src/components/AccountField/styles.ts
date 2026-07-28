import { StyleSheet } from "react-native";
import { colors } from "../../constants/Colors";
import { FontFamily, FontSize } from "../../constants/Fonts";

export const styles = StyleSheet.create({
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
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: colors.brown[400],
    borderRadius: 10,
    paddingLeft: 14,
    paddingRight: 14,
    fontSize: FontSize.body,
    fontFamily: FontFamily.regular,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  inputWithSave: {
    paddingRight: 92,
  },
  inputDisabled: {
    borderColor: colors.border,
    color: colors.gray[500],
    backgroundColor: "#F5F5F5",
  },
  saveButton: {
    position: "absolute",
    right: 5,
    top: 5,
    bottom: 5,
    backgroundColor: colors.brown[800],
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: colors.white,
    fontSize: FontSize.description,
    fontFamily: FontFamily.bold,
  },
});
