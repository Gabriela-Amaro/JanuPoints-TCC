import React, { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./styles";

interface ScreenContainerProps {
  headerContent: ReactNode;
  children: ReactNode;
}

/**
 * Container padrão para todas as telas das tabs.
 */
export function ScreenContainer({ headerContent, children }: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        {headerContent}
      </View>

      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}
