import { StyleSheet } from "react-native";
import { colors } from "../../constants/Colors";
import { FontFamily, FontSize } from "../../constants/Fonts";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.brown[800],
    borderBottomLeftRadius: 28,
    borderTopLeftRadius: 28,  
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 22,
    paddingLeft: 16,
    marginRight: -16,
  },
  text: {
    fontSize: FontSize.subtitle,
    fontFamily: FontFamily.medium,
    color: colors.white,
  },  
  textContainer: {
    paddingRight: 16,
  },
})