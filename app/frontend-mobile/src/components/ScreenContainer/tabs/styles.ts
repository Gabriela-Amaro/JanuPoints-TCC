import { StyleSheet } from "react-native";
import { colors } from "../../../constants/Colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    minHeight: 116,
    justifyContent: "flex-end",
    backgroundColor: colors.brown[100],
  },
  content: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
});