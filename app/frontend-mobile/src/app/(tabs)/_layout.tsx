import { Tabs } from "expo-router";
import { colors } from "../../constants/Colors";
import { FontFamily, FontSize } from "../../constants/Fonts";
import Icon, { IconName } from "../../constants/icons";

const ICON_MAPPING: Record<string, IconName> = {
  "home/index": "home",
  "busca/index": "search",
  "transacoes/index": "transacoes",
  "perfil/index": "perfil",
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.black[800], // Cor do ícone selecionado
        tabBarInactiveTintColor: colors.white, // Cor do ícone não selecionado",
        tabBarStyle: {
          borderTopWidth: 0,
          height: 62,
          paddingBottom: 3,
          paddingTop: 3,
          backgroundColor: colors.brown[400],
        },
        tabBarLabelStyle: {
          fontFamily: FontFamily.regular,
          fontSize: FontSize.small,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconName = ICON_MAPPING[route.name];

          return <Icon name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="home/index" options={{ title: "Inicio" }} />

      <Tabs.Screen name="busca/index" options={{ title: "Busca" }} />

      <Tabs.Screen name="transacoes/index" options={{ title: "Transações" }} />

      <Tabs.Screen name="perfil/index" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
