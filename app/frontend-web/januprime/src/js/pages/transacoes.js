import { showNotification } from '../utils/notifications.js';
import { ticketsService } from '../services/tickets.js';
import { exibirTicketModal } from '../components/ticket-modal.js';

// Estado global da página
let transacoesCarregadas = [];

/**
 * Mapeia status do backend para exibição
 */
function mapearStatus(status) {
  const statusMap = {
    'ABERTO': { label: 'Pendente', class: 'bg-warning' },
    'CONCLUIDO': { label: 'Aprovado', class: 'bg-success' },
    'APROVADO': { label: 'Aprovado', class: 'bg-success' },
    'RECUSADO': { label: 'Rejeitado', class: 'bg-danger' },
    'CANCELADO': { label: 'Cancelado', class: 'bg-secondary' },
  };
  return statusMap[status] || { label: status, class: 'bg-secondary' };
}

/**
 * Carrega transações da API
 */
async function carregarTransacoes() {
  try {
    const tickets = await ticketsService.listarTodos();
    transacoesCarregadas = Array.isArray(tickets) ? tickets : [];
    atualizarExibicaoTransacoes(transacoesCarregadas);
  } catch (error) {
    console.error('Erro ao carregar transações:', error);
    showNotification('Erro ao carregar transações', 'error');
    // Mostrar mensagem de erro no tbody
    const tbody = document.querySelector('#transacoes-table tbody') || document.querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4">
            <i class="bi bi-exclamation-triangle text-warning" style="font-size: 2rem;"></i>
            <h6 class="mt-2 text-muted">Erro ao carregar transações</h6>
            <p class="text-muted small">Tente recarregar a página.</p>
          </td>
        </tr>
      `;
    }
  }
}



// Função para aplicar filtros automaticamente
export function aplicarFiltrosTransacoesAuto() {
  const termo = document.getElementById('pesquisaTransacao')?.value.toLowerCase() || '';
  const tipo = document.getElementById('filtroTipo')?.value || '';
  const status = document.getElementById('filtroStatus')?.value || '';
  const data = document.getElementById('filtroData')?.value || '';
  
  let transacoesFiltradas = [...transacoesCarregadas];
  
  // Filtro por termo de busca
  if (termo) {
    transacoesFiltradas = transacoesFiltradas.filter(transacao => {
      const nomeCliente = (transacao.nome_cliente || '').toLowerCase();
      const codigo = (transacao.codigo || '').toLowerCase();
      const nomeProduto = (transacao.nome_produto || '').toLowerCase();
      const nomeEstabelecimento = (transacao.nome_estabelecimento || '').toLowerCase();
      const id = transacao.id?.toString() || '';
      
      return nomeCliente.includes(termo) ||
             codigo.includes(termo) ||
             id.includes(termo) ||
             nomeProduto.includes(termo) ||
             nomeEstabelecimento.includes(termo);
    });
  }
  
  // Filtro por tipo
  if (tipo) {
    transacoesFiltradas = transacoesFiltradas.filter(transacao => 
      transacao.tipo === tipo
    );
  }
  
  // Filtro por status
  if (status) {
    transacoesFiltradas = transacoesFiltradas.filter(transacao => {
      // Tratar CONCLUIDO e APROVADO como "Aprovado" para o filtro
      if (status === 'APROVADO') {
        return transacao.status === 'CONCLUIDO' || transacao.status === 'APROVADO';
      }
      return transacao.status === status;
    });
  }
  
  // Filtro por data
  if (data) {
    transacoesFiltradas = transacoesFiltradas.filter(transacao => {
      const transacaoData = new Date(transacao.created_at).toISOString().split('T')[0];
      return transacaoData === data;
    });
  }
  
  // Atualizar a exibição das transações
  atualizarExibicaoTransacoes(transacoesFiltradas);
}

// Função para atualizar a exibição das transações
function atualizarExibicaoTransacoes(transacoes) {
  const tbody = document.querySelector('#transacoes-table-body') || document.querySelector('tbody');
  if (!tbody) {
    console.error('Tbody não encontrado');
    return;
  }
  
  if (transacoes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4">
          <i class="bi bi-search text-muted" style="font-size: 2rem;"></i>
          <h6 class="mt-2 text-muted">Nenhuma transação encontrada!</h6>
          <p class="text-muted small">Tente ajustar os filtros de busca.</p>
        </td>
      </tr>
    `;
    return;
  }
  
  const html = transacoes.map(transacao => {
    const tipo = transacao.tipo; // 'credito' ou 'debito'
    const statusInfo = mapearStatus(transacao.status);
    const nomeCliente = transacao.nome_cliente || 'N/A';
    const data = new Date(transacao.created_at);
    const isPendente = transacao.status === 'ABERTO';
    
    // Determinar valor/pontos baseado no tipo
    let valorPontos = '';
    if (tipo === 'credito') {
      valorPontos = `R$ ${parseFloat(transacao.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      valorPontos = `${transacao.pontos || 0} pts`;
    }
    
    return `
      <tr>
        <td>#${transacao.codigo || transacao.id}</td>
        <td>
          <span class="badge ${tipo === 'credito' ? 'bg-success' : 'bg-warning'}">
            ${tipo === 'credito' ? 'Crédito' : 'Débito'}
          </span>
        </td>
        <td>${nomeCliente}</td>
        <td>${valorPontos}</td>
        <td>
          <span class="badge ${statusInfo.class}">
            ${statusInfo.label}
          </span>
        </td>
        <td>${String(data.getHours()).padStart(2,'0')}:${String(data.getMinutes()).padStart(2,'0')} - ${String(data.getDate()).padStart(2,'0')}/${String(data.getMonth()+1).padStart(2,'0')}</td>
        <td>
          <div class="btn-group" role="group">
            <button class="btn btn-sm btn-outline-primary" onclick="visualizarTransacao(${transacao.id}, '${tipo}')" title="Visualizar">
              <i class="bi bi-eye"></i>
            </button>
            ${isPendente ? `
              <button class="btn btn-sm btn-outline-success" onclick="aprovarTransacao(${transacao.id}, '${tipo}')" title="Aprovar">
                <i class="bi bi-check-lg"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="rejeitarTransacao(${transacao.id}, '${tipo}')" title="Rejeitar">
                <i class="bi bi-x-lg"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
  tbody.innerHTML = html;

}

// Função para limpar todos os filtros
export function limparFiltrosTransacoes() {
  const pesquisaInput = document.getElementById('pesquisaTransacao');
  const tipoSelect = document.getElementById('filtroTipo');
  const statusSelect = document.getElementById('filtroStatus');
  const dataInput = document.getElementById('filtroData');
  
  if (pesquisaInput) pesquisaInput.value = '';
  if (tipoSelect) tipoSelect.value = '';
  if (statusSelect) statusSelect.value = '';
  if (dataInput) dataInput.value = '';
  
  aplicarFiltrosTransacoesAuto();
}

// Funções para manipular transações
export async function aprovarTransacao(id, tipo) {
  try {
    if (tipo === 'credito') {
      await ticketsService.aprovarCredito(id);
    } else {
      await ticketsService.aprovarDebito(id);
    }
    showNotification('Transação aprovada com sucesso!', 'success');
    await carregarTransacoes();
  } catch (error) {
    console.error('Erro ao aprovar transação:', error);
    showNotification(`Erro ao aprovar transação: ${error.message || 'Erro desconhecido'}`, 'error');
  }
}

export async function rejeitarTransacao(id, tipo) {
  const motivo = prompt('Informe o motivo da recusa (opcional):') || '';
  
  try {
    if (tipo === 'credito') {
      await ticketsService.recusarCredito(id, motivo);
    } else {
      await ticketsService.recusarDebito(id);
    }
    showNotification('Transação recusada com sucesso!', 'success');
    await carregarTransacoes();
  } catch (error) {
    console.error('Erro ao recusar transação:', error);
    showNotification(`Erro ao recusar transação: ${error.message || 'Erro desconhecido'}`, 'error');
  }
}

export async function visualizarTransacao(id, tipo) {
  try {
    // Buscar ticket da API
    let ticket;
    if (tipo === 'credito') {
      ticket = await ticketsService.obterCredito(id);
    } else {
      ticket = await ticketsService.obterDebito(id);
    }

    if (!ticket) {
      showNotification('Transação não encontrada', 'error');
      return;
    }

    // Usar o componente reutilizável de modal
    exibirTicketModal(ticket, tipo, {
      modalId: 'transacaoModal',
      onAprovar: 'aprovarTransacao',
      onRejeitar: 'rejeitarTransacao'
    });
  } catch (error) {
    console.error('Erro ao visualizar transação:', error);
    showNotification(`Erro ao carregar detalhes: ${error.message || 'Erro desconhecido'}`, 'error');
  }
}


// Exportar funções para escopo global
window.aprovarTransacao = aprovarTransacao;
window.rejeitarTransacao = rejeitarTransacao;
window.visualizarTransacao = visualizarTransacao;
window.carregarTransacoes = carregarTransacoes;
