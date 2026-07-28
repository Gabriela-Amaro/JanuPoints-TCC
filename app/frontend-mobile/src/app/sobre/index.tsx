import React from "react";
import { ScrollView, Text, View } from "react-native";
import { ProfileHeader } from "../../components/ProfileHeader";
import { styles } from "./styles";

export default function SobreScreen() {
  return (
    <View style={styles.container}>
      {/* Cabeçalho exclusivo para sub-páginas do Perfil */}
      <ProfileHeader title="Sobre" />

      {/* Conteúdo principal */}
      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.aboutText}>
            O Janu Prime é o seu aplicativo completo de fidelidade e recompensas. Nosso objetivo é conectar você aos melhores estabelecimentos parceiros da região, valorizando cada compra realizada.
            {"\n\n"}
            Com o Janu Prime, você acumula pontos de forma simples enviando suas notas fiscais, acompanha seu extrato de transações em tempo real e resgata produtos e prêmios exclusivos diretamente no seu celular.
            {"\n\n"}
            Além disso, você pode avaliar suas experiências nos estabelecimentos e consultar opiniões de outros clientes para fazer as melhores escolhas.
            {"\n\n"}
            Aproveite todas as vantagens de ser um cliente Janu Prime!
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}
