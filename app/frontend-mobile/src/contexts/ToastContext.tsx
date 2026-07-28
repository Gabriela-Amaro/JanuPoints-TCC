import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AlertCircle, CheckCircle2, X } from "lucide-react-native";
import { colors } from "../constants/Colors";
import { FontFamily, FontSize } from "../constants/Fonts";

export type ToastType = "error" | "success";

export interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastData | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -60,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  }, [fadeAnim, slideAnim]);

  const showToast = useCallback(
    (message: string, type: ToastType) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setToast({
        id: Date.now(),
        message,
        type,
      });

      fadeAnim.setValue(0);
      slideAnim.setValue(-60);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Esconde automaticamente após 4 segundos
      timerRef.current = setTimeout(() => {
        hideToast();
      }, 4000);
    },
    [fadeAnim, slideAnim, hideToast]
  );

  const showError = useCallback(
    (message: string) => {
      showToast(message, "error");
    },
    [showToast]
  );

  const showSuccess = useCallback(
    (message: string) => {
      showToast(message, "success");
    },
    [showToast]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const isError = toast?.type === "error";

  return (
    <ToastContext.Provider value={{ showError, showSuccess, hideToast }}>
      {children}

      {toast && (
        <Animated.View
          style={[
            styles.bannerContainer,
            {
              top: Math.max(insets.top + 8, 16),
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: isError ? "#E53935" : colors.success,
            },
          ]}
        >
          <View style={styles.iconContainer}>
            {isError ? (
              <AlertCircle size={22} color={colors.white} />
            ) : (
              <CheckCircle2 size={22} color={colors.white} />
            )}
          </View>

          <Text style={styles.messageText}>{toast.message}</Text>

          <TouchableOpacity
            onPress={hideToast}
            style={styles.closeButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color={colors.white} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextData {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de um ToastProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 99999,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 8,
    shadowColor: colors.black[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  iconContainer: {
    marginRight: 10,
  },
  messageText: {
    flex: 1,
    fontSize: FontSize.description,
    fontFamily: FontFamily.medium,
    color: colors.white,
    lineHeight: 18,
  },
  closeButton: {
    marginLeft: 10,
    padding: 2,
  },
});
