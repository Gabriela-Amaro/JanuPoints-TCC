// Configuração global da aplicação
export const APP_CONFIG = {
  // Define VITE_API_URL no build de produção (ex.: https://api.seudominio.com/api)
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  authEndpoints: {
    login: "/auth/token/",
    refresh: "/auth/token/refresh/",
    logout: "/auth/logout/",
    me: "/me/",
  },
  endpoints: {
    produtos: "/produtos/",
    ticketsDebito: "/tickets/debito/",
    ticketsCredito: "/tickets/credito/",
    ticketStream: "/tickets/stream/",
    estabelecimentos: "/estabelecimentos/",
  },
};
