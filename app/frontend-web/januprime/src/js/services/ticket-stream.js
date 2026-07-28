/**
 * Serviço de streaming de tickets em tempo real via SSE (Server-Sent Events)
 * Conecta ao endpoint SSE do backend e notifica callbacks quando novos tickets chegam.
 */
import { APP_CONFIG } from "../config/app.js";

class TicketStream {
  constructor() {
    this.eventSource = null;
    this.onNewTickets = null;
    this.onInit = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectTimer = null;
  }

  /**
   * Conecta ao stream SSE de tickets.
   * @param {Object} callbacks - { onInit, onNewTickets }
   *   onInit(tickets[]) — chamado com snapshot inicial de tickets abertos
   *   onNewTickets(tickets[]) — chamado quando novos tickets são detectados
   */
  connect({ onInit, onNewTickets }) {
    this.onInit = onInit;
    this.onNewTickets = onNewTickets;

    this._doConnect();
  }

  _doConnect() {
    // Obter JWT token do localStorage
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (!token) {
      console.warn("[TicketStream] Token JWT não encontrado, SSE não conectado.");
      return;
    }

    // Fechar conexão anterior se existir
    this._closeEventSource();

    const baseUrl = APP_CONFIG.apiUrl.replace("/api", "");
    const streamUrl = `${baseUrl}/api${APP_CONFIG.endpoints.ticketStream}?token=${token}`;

    console.log("[TicketStream] Conectando ao SSE...");
    this.eventSource = new EventSource(streamUrl);

    // Evento de snapshot inicial
    this.eventSource.addEventListener("init", (event) => {
      try {
        const tickets = JSON.parse(event.data);
        console.log("[TicketStream] Snapshot inicial recebido:", tickets.length, "tickets");
        this.reconnectAttempts = 0; // Reset on successful connection
        if (this.onInit) this.onInit(tickets);
      } catch (e) {
        console.error("[TicketStream] Erro ao parsear evento init:", e);
      }
    });

    // Evento de novos tickets
    this.eventSource.addEventListener("new_tickets", (event) => {
      try {
        const newTickets = JSON.parse(event.data);
        console.log("[TicketStream] Novos tickets recebidos:", newTickets.length);
        if (this.onNewTickets) this.onNewTickets(newTickets);
      } catch (e) {
        console.error("[TicketStream] Erro ao parsear evento new_tickets:", e);
      }
    });

    // Evento de erro do backend
    this.eventSource.addEventListener("error_event", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.error("[TicketStream] Erro do servidor:", data.message);
      } catch (e) {
        // Ignore
      }
    });

    // Tratamento de erros de conexão
    this.eventSource.onerror = () => {
      console.warn("[TicketStream] Conexão perdida. Tentando reconectar...");
      this._closeEventSource();
      this._scheduleReconnect();
    };

    this.eventSource.onopen = () => {
      console.log("[TicketStream] Conexão SSE estabelecida.");
      this.reconnectAttempts = 0;
    };
  }

  _scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[TicketStream] Máximo de tentativas de reconexão atingido.");
      return;
    }

    // Backoff exponencial: 2s, 4s, 8s, 16s... até 60s
    const delay = Math.min(2000 * Math.pow(2, this.reconnectAttempts), 60000);
    this.reconnectAttempts++;

    console.log(
      `[TicketStream] Reconectando em ${delay / 1000}s (tentativa ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      this._doConnect();
    }, delay);
  }

  _closeEventSource() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * Desconecta o stream SSE.
   * Deve ser chamado ao sair do dashboard.
   */
  disconnect() {
    console.log("[TicketStream] Desconectando SSE...");
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this._closeEventSource();
    this.reconnectAttempts = 0;
    this.onInit = null;
    this.onNewTickets = null;
  }

  /**
   * Verifica se o stream está ativo.
   */
  isConnected() {
    return this.eventSource !== null && this.eventSource.readyState !== EventSource.CLOSED;
  }
}

export const ticketStream = new TicketStream();
