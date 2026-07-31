import { Tabs } from "expo-router";
import { colors } from "../../constants/Colors";
import { FontFamily, FontSize } from "../../constants/Fonts";
import Icon, { IconName } from "../../constants/icons";

const ICON_MAPPING: Record<string, IconName> = {
  "busca/index": "search",
  "home/index": "home",
  "transacoes/index": "transacoes",
  "perfil/index": "perfil",
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.black[800],
        tabBarInactiveTintColor: colors.brown[100],
        tabBarStyle: {
          borderTopWidth: 0,
          height: 62,
          paddingBottom: 3,
          paddingTop: 3,
          backgroundColor: colors.brown[800],
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
      <Tabs.Screen name="home/index" options={{ title: "Início" }} />
      <Tabs.Screen name="busca/index" options={{ title: "Buscar" }} />
      <Tabs.Screen name="transacoes/index" options={{ title: "Histórico" }} />

      <Tabs.Screen name="perfil/index" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
