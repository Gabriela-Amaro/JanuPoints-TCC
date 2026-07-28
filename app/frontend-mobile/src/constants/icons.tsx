import { HandCoins, House, ReceiptText, Search, User } from "lucide-react-native";

// Cria um mapa dos ícones disponíveis no seu app
const iconMap = {
  home: House,
  search: Search,
  transacoes: ReceiptText,
  perfil: User,
  coins: HandCoins,
};

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName;
  color?: string;
  size?: number;
}

const Icon = ({ name, color, size = 24 }: IconProps) => {
  const LucideIcon = iconMap[name];

  if (!LucideIcon) {
    return null;
  }

  return <LucideIcon color={color} size={size} />;
};

export default Icon;
