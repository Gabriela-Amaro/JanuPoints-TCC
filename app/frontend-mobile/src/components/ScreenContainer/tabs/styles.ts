import { StyleSheet } from "react-native";
import { colors } from "../../../constants/Colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brown[100],
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    height: 130,
    justifyContent: "flex-end",
  },
  content: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});