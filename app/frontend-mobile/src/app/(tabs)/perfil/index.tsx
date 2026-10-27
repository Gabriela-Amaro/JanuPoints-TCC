import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight, LogOut, Shield, User } from "lucide-react-native";
import { ScreenContainer } from "../../../components/ScreenContainer/tabs/ScreenContainer";
import { useAuth } from "../../../contexts/AuthContext";
import { colors } from "../../../constants/Colors";
import { styles } from "../../../styles/screens/(tabs)/perfil/styles";

/** Perfil mínimo: identificação do participante e saída da aplicação. */
export default function Perfil() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const firstName = user?.nome ? user.nome.split(" ")[0] : "Usuário";

  function handleLogout() {
    Alert.alert("Sair da conta", "Deseja realmente sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: signOut },
    ]);
  }

  return (
    <ScreenContainer
      headerContent={
        <View>
          <Text style={styles.eyebrow}>Participante</Text>
          <Text style={styles.headerTitle}>{firstName}</Text>
        </View>
      }
    >
      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <User size={28} color={colors.white} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.nome ?? "Usuário"}</Text>
            <Text style={styles.email}>{user?.email ?? ""}</Text>
          </View>
        </View>

        <View style={styles.pointsCard}>
          <Text style={styles.pointsLabel}>Saldo disponível</Text>
          <Text style={styles.pointsValue}>{user?.pontos ?? 0} pontos</Text>
          <Text style={styles.pointsHelper}>
            Use seus pontos para resgatar benefícios nos estabelecimentos parceiros.
          </Text>
        </View>

        <View style={styles.accountActions}>
          <TouchableOpacity
            style={styles.accountAction}
            onPress={() => router.push("/conta")}
            activeOpacity={0.8}
          >
            <View style={styles.actionIcon}>
              <User size={20} color={colors.brown[800]} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Dados pessoais</Text>
              <Text style={styles.actionDescription}>Consulte e edite seus dados</Text>
            </View>
            <ChevronRight size={20} color={colors.gray[500]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.accountAction}
            onPress={() => router.push("/seguranca")}
            activeOpacity={0.8}
          >
            <View style={styles.actionIcon}>
              <Shield size={20} color={colors.brown[800]} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Senha</Text>
              <Text style={styles.actionDescription}>Altere sua senha de acesso</Text>
            </View>
            <ChevronRight size={20} color={colors.gray[500]} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={20} color={colors.errorDark} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
