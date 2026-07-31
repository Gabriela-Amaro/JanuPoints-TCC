import { getMainFooter } from '../components/main-footer.js';
import { ticketsService } from '../services/tickets.js';
import { showNotification } from '../utils/notifications.js';
import { exibirTicketModal } from '../components/ticket-modal.js';
import { ticketStream } from '../services/ticket-stream.js';

function responseItems(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

function formatarDataAbertura(dateValue) {
  if (!dateValue) return "Data não informada";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(dateValue));
}

function renderSolicitacoes(tickets, tipo) {
  const container = document.getElementById(`tickets-${tipo}-container`);
  const count = document.getElementById(`contador-${tipo}`);
  if (!container) return;
  if (count) count.textContent = tickets.length;
  if (!tickets.length) {
    container.innerHTML = '<div class="empty-state py-3"><i class="bi bi-check2-circle"></i><p>Nenhuma solicitação pendente.</p></div>';
    return;
  }
  container.innerHTML = tickets.map((ticket) => `
    <div class="request-item">
      <div class="request-info"><strong>${tipo === 'credito' ? 'Acúmulo de pontos' : 'Resgate de pontos'}</strong><small class="text-muted">${ticket.nome_cliente || 'Cliente'} · ${ticket.codigo || 'sem código'}</small><small class="request-date"><i class="bi bi-clock me-1"></i>Aberto em ${formatarDataAbertura(ticket.created_at)}</small></div>
      <div class="request-actions"><strong class="request-points">${ticket.pontos || 0} pts</strong><div class="request-buttons"><button class="btn btn-sm btn-outline-primary" title="Visualizar ticket" onclick="visualizarSolicitacao(${ticket.id}, '${tipo}')"><i class="bi bi-eye"></i></button><button class="btn btn-sm btn-success" onclick="aprovarSolicitacao(${ticket.id}, '${tipo}')">Aprovar</button><button class="btn btn-sm btn-outline-danger" onclick="recusarSolicitacao(${ticket.id}, '${tipo}')">Recusar</button></div></div>
    </div>
  `).join('');
}

export async function carregarDadosDashboardTcc() {
  try {
    const [creditosResponse, debitosResponse] = await Promise.all([
      ticketsService.listarCredito({ status: 'ABERTO' }),
      ticketsService.listarDebito({ status: 'ABERTO' }),
    ]);
    const creditos = responseItems(creditosResponse).filter((ticket) => ticket.status === 'ABERTO');
    const debitos = responseItems(debitosResponse).filter((ticket) => ticket.status === 'ABERTO');
    const total = document.getElementById('contador-tickets-pendentes');
    if (total) total.textContent = creditos.length + debitos.length;
    renderSolicitacoes(creditos, 'credito');
    renderSolicitacoes(debitos, 'debito');
    ticketStream.connect(() => carregarDadosDashboardTcc());
  } catch (error) {
    console.error('Erro ao carregar solicitações:', error);
    showNotification('Não foi possível carregar a fila de solicitações.', 'error');
  }
}

window.aprovarSolicitacao = async (id, tipo) => {
  try {
    await (tipo === 'credito' ? ticketsService.aprovarCredito(id) : ticketsService.aprovarDebito(id));
    showNotification('Solicitação aprovada.', 'success');
    await carregarDadosDashboardTcc();
  } catch (error) {
    showNotification('Não foi possível aprovar a solicitação.', 'error');
  }
};

window.visualizarSolicitacao = async (id, tipo) => {
  try {
    const ticket = tipo === 'credito'
      ? await ticketsService.obterCredito(id)
      : await ticketsService.obterDebito(id);
    exibirTicketModal(ticket, tipo, {
      modalId: 'solicitacaoModal',
      onAprovar: 'aprovarSolicitacao',
      onRejeitar: 'recusarSolicitacao',
    });
  } catch (error) {
    showNotification('Não foi possível abrir a solicitação.', 'error');
  }
};

window.recusarSolicitacao = async (id, tipo) => {
  try {
    await (tipo === 'credito' ? ticketsService.recusarCredito(id) : ticketsService.recusarDebito(id));
    showNotification('Solicitação recusada.', 'success');
    await carregarDadosDashboardTcc();
  } catch (error) {
    showNotification('Não foi possível recusar a solicitação.', 'error');
  }
};

/**
 * Visão geral do recorte acadêmico. A fila continua sendo preenchida pelas
 * funções existentes do painel, mas a interface mostra apenas o ciclo central.
 */
export function getDashboardContent() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const nome = (userData.nome || 'usuário').split(' ')[0];

  return `
    <div class="container-fluid">
      <div class="page-heading mb-4">
        <span class="eyebrow">Painel do estabelecimento</span>
        <h1 class="text-gradient mb-1">Olá, ${nome}.</h1>
        <p class="text-muted mb-0">Analise as solicitações e mantenha suas recompensas disponíveis.</p>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-7">
          <div class="card h-100 border-start border-4 border-primary">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start gap-3">
                <div>
                  <span class="eyebrow text-primary">Fila de análise</span>
                  <h2 class="h4 mt-2 mb-2">Solicitações pendentes</h2>
                  <p class="text-muted mb-3">Aprove ou recuse acúmulos de notas fiscais e resgates de pontos.</p>
                </div>
                <span class="summary-number" id="contador-tickets-pendentes">–</span>
              </div>
              <button class="btn btn-primary" onclick="showPage('transacoes')">
                <i class="bi bi-inbox me-2"></i>Ver solicitações
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-5">
          <div class="card h-100">
            <div class="card-body p-4">
              <span class="eyebrow text-primary">Próximo passo</span>
              <h2 class="h5 mt-2">Configure suas recompensas</h2>
              <p class="text-muted small">Cadastre os benefícios que os clientes poderão resgatar usando pontos.</p>
              <button class="btn btn-outline-primary" onclick="showPage('catalogo')">
                <i class="bi bi-gift me-2"></i>Ir para recompensas
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3" id="secao-tickets">
        <div class="col-lg-6">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h2 class="h6 mb-0"><i class="bi bi-receipt me-2 text-primary"></i>Acúmulos de pontos</h2>
              <span class="badge bg-success-subtle text-success" id="contador-credito">0</span>
            </div>
            <div class="card-body" id="tickets-credito-container">
              <div class="empty-state py-3"><i class="bi bi-hourglass-split"></i><p>Carregando solicitações...</p></div>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h2 class="h6 mb-0"><i class="bi bi-gift me-2 text-primary"></i>Resgates de pontos</h2>
              <span class="badge bg-warning-subtle text-warning" id="contador-debito">0</span>
            </div>
            <div class="card-body" id="tickets-debito-container">
              <div class="empty-state py-3"><i class="bi bi-hourglass-split"></i><p>Carregando solicitações...</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    ${getMainFooter()}
  `;
}
