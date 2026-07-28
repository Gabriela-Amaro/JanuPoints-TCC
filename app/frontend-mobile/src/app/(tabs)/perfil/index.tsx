import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Bell, User, Shield, Info, LogOut } from "lucide-react-native";
import { ScreenContainer } from "../../../components/ScreenContainer/tabs/ScreenContainer";
import { useAuth } from "../../../contexts/AuthContext";
import { colors } from "../../../constants/Colors";
import { styles } from "./styles";

export default function Perfil() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const firstName = user?.nome ? user.nome.split(" ")[0] : "Usuário";

  function handleLogout() {
    Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: signOut },
    ]);
  }

  return (
    <ScreenContainer
      headerContent={
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{firstName}</Text>
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
            <Bell size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.content}>
        <View style={styles.menuList}>
          {/* Conta */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push("/conta")}
          >
            <User size={22} color={colors.textPrimary} style={styles.menuIcon} />
            <Text style={styles.menuText}>Conta</Text>
          </TouchableOpacity>

          {/* Segurança */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push("/seguranca")}
          >
            <Shield size={22} color={colors.textPrimary} style={styles.menuIcon} />
            <Text style={styles.menuText}>Segurança</Text>
          </TouchableOpacity>

          {/* Sobre */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push("/sobre")}
          >
            <Info size={22} color={colors.textPrimary} style={styles.menuIcon} />
            <Text style={styles.menuText}>Sobre</Text>
          </TouchableOpacity>

          {/* Sair */}
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout} activeOpacity={0.7}>
            <LogOut size={22} color={colors.error} style={styles.menuIcon} />
            <Text style={[styles.menuText, styles.menuTextLogout]}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}
