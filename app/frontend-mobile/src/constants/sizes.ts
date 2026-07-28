import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const window = {
  width,
  height,
};

export const screen = Dimensions.get("screen");
