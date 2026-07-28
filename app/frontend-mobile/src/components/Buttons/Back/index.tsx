import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { colors } from "../../../constants/Colors";

interface BackButtonProps {
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  color?: string;
}

export function BackButton({ style, onPress, color }: BackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.backButton, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <ChevronLeft size={20} color={color || colors.white} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
