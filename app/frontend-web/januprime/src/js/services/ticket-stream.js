import { APP_CONFIG } from "../config/app.js";

class TicketStream {
  constructor() {
    this.source = null;
  }

  connect(onChange) {
    if (this.source) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const endpoint = `${APP_CONFIG.apiUrl}${APP_CONFIG.endpoints.ticketStream}`;
    const url = `${endpoint}?token=${encodeURIComponent(token)}`;
    const source = new EventSource(url);

    source.addEventListener("tickets_changed", () => {
      onChange?.();
    });

    source.addEventListener("error", () => {
      // EventSource tenta reconectar automaticamente em falhas transitórias.
      // Falhas de autenticação são tratadas pelo carregamento REST da tela.
    });

    this.source = source;
  }

  disconnect() {
    if (!this.source) return;
    this.source.close();
    this.source = null;
  }
}

export const ticketStream = new TicketStream();
window.desconectarTicketStream = () => ticketStream.disconnect();
