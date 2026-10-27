import { APP_CONFIG } from '../config/app.js';
import '../../css/ticket-modal.css';

function getImagemUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${APP_CONFIG.apiUrl.replace('/api', '')}/media${path.startsWith('/') ? path : `/${path}`}`;
}

function campo(label, value) {
  return `<div class="ticket-field"><dt>${label}</dt><dd>${value ?? 'Não informado'}</dd></div>`;
}

function imagem(url, label) {
  return `<section class="ticket-attachment" aria-label="${label}">
    <h6>${label}</h6>
    ${url ? `<a href="${url}" target="_blank" rel="noopener noreferrer" class="ticket-image-link" title="Abrir imagem em nova aba"><img src="${url}" alt="${label}"></a>
    <a href="${url}" target="_blank" rel="noopener noreferrer" class="ticket-image-open">Abrir imagem em nova aba ↗</a>`
    : '<div class="ticket-no-image">Nenhuma imagem enviada</div>'}
  </section>`;
}

export function gerarTicketModalHTML(ticket, tipo, options = {}) {
  const { modalId = 'ticketModal', onAprovar = 'aprovarTicket', onRejeitar = 'rejeitarTicket' } = options;
  const credito = tipo === 'credito';
  const status = { ABERTO: 'Aberto', APROVADO: 'Aprovado', CONCLUIDO: 'Concluído', RECUSADO: 'Recusado', REJEITADO: 'Rejeitado', CANCELADO: 'Cancelado' };
  const statusClass = ['APROVADO', 'CONCLUIDO'].includes(ticket.status) ? 'approved' : ['RECUSADO', 'REJEITADO', 'CANCELADO'].includes(ticket.status) ? 'closed' : 'open';
  const detalhes = credito
    ? `<section class="ticket-section"><h6>Nota fiscal</h6><dl class="ticket-fields">
        ${campo('Número da nota', ticket.numero_nota)}
        ${campo('Data da nota', ticket.data_nota ? new Date(`${ticket.data_nota.slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR') : null)}
        ${campo('Valor total', Number(ticket.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))}
        ${campo('Estabelecimento', ticket.nome_estabelecimento)}
      </dl></section>`
    : `<section class="ticket-section"><h6>Resgate</h6><dl class="ticket-fields">${campo('Produto solicitado', ticket.nome_produto)}${campo('Código do ticket', `#${ticket.codigo || ticket.id}`)}</dl></section>`;

  return `<div class="modal fade ticket-detail" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered"><div class="modal-content">
      <div class="modal-header">
        <div><span class="ticket-kind">${credito ? 'Crédito de pontos' : 'Resgate de produto'}</span>
        <h5 class="modal-title" id="${modalId}Label">Ticket #${ticket.codigo || ticket.id}</h5></div>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
      </div>
      <div class="modal-body">
        <div class="ticket-layout">
          ${imagem(getImagemUrl(credito ? ticket.imagem : ticket.imagem_produto), credito ? 'Nota fiscal enviada' : 'Imagem do produto')}
          <div class="ticket-details">
            <section class="ticket-section"><div class="ticket-section-heading"><h6>Solicitação</h6><span class="ticket-status ticket-status--${statusClass}">${status[ticket.status] || ticket.status}</span></div>
              <dl class="ticket-fields">${campo('Cliente', ticket.nome_cliente)}${campo('Enviado em', new Date(ticket.created_at).toLocaleString('pt-BR'))}</dl>
            </section>
            ${detalhes}
            <div class="ticket-points"><span>Pontos a ${credito ? 'creditar' : 'debitar'}</span><strong>${ticket.pontos || 0} <small>pontos</small></strong></div>
            ${ticket.observacao ? `<section class="ticket-section ticket-observation"><h6>Observação</h6><p>${ticket.observacao}</p></section>` : ''}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn ticket-close" data-bs-dismiss="modal">Fechar</button>
        ${ticket.status === 'ABERTO' ? `<button type="button" class="btn ticket-reject" onclick="${onRejeitar}(${ticket.id}, '${tipo}'); bootstrap.Modal.getInstance(document.getElementById('${modalId}')).hide();">Recusar</button>
        <button type="button" class="btn btn-success" onclick="${onAprovar}(${ticket.id}, '${tipo}'); bootstrap.Modal.getInstance(document.getElementById('${modalId}')).hide();">Aprovar</button>` : ''}
      </div>
    </div></div>
  </div>`;
}

/**
 * Exibe o modal de ticket
 * @param {Object} ticket - Dados do ticket
 * @param {string} tipo - Tipo do ticket: 'credito' ou 'debito'
 * @param {Object} options - Opções adicionais (ver gerarTicketModalHTML)
 */
export function exibirTicketModal(ticket, tipo, options = {}) {
  const modalId = options.modalId || 'ticketModal';
  
  // Remover modal existente se houver
  const existingModal = document.getElementById(modalId);
  if (existingModal) {
    existingModal.remove();
  }

  // Gerar e inserir o modal
  const modalHtml = gerarTicketModalHTML(ticket, tipo, options);
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  // Mostrar o modal
  const modal = new window.bootstrap.Modal(document.getElementById(modalId));
  modal.show();
}
