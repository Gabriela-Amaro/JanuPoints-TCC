import { getMainFooter } from '../components/main-footer.js';

/** Fila operacional para consulta, análise e decisão das solicitações. */
export function getTransacoesContent() {
  setTimeout(() => {
    if (typeof window.carregarTransacoes === 'function') window.carregarTransacoes();
  }, 100);

  return `
    <div class="container-fluid mb-5">
      <div class="page-heading mb-4">
        <span class="eyebrow">Operação</span>
        <h1 class="text-gradient mb-1">Solicitações</h1>
        <p class="text-muted mb-0">Consulte, aprove ou recuse as operações enviadas pelos clientes.</p>
      </div>

      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3 align-items-end">
            <div class="col-12 col-lg-5">
              <label for="pesquisaTransacao" class="form-label">Pesquisar cliente ou código</label>
              <div class="input-group">
                <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                <input type="search" class="form-control" id="pesquisaTransacao" placeholder="Digite um nome ou código" oninput="aplicarFiltrosTransacoesAuto()">
              </div>
            </div>
            <div class="col-12 col-md-4 col-lg-2">
              <label for="filtroTipo" class="form-label">Tipo</label>
              <select class="form-select" id="filtroTipo" onchange="aplicarFiltrosTransacoesAuto()">
                <option value="">Todos</option>
                <option value="credito">Crédito</option>
                <option value="debito">Débito</option>
              </select>
            </div>
            <div class="col-12 col-md-4 col-lg-2">
              <label for="filtroStatus" class="form-label">Status</label>
              <select class="form-select" id="filtroStatus" onchange="aplicarFiltrosTransacoesAuto()">
                <option value="">Todos</option>
                <option value="ABERTO">Pendente</option>
                <option value="APROVADO">Aprovado</option>
                <option value="RECUSADO">Rejeitado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
            <div class="col-12 col-md-4 col-lg-3">
              <button class="btn btn-outline-secondary w-100" type="button" onclick="limparFiltrosTransacoes()">
                <i class="bi bi-arrow-counterclockwise me-1"></i>Limpar filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <div>
            <h2 class="h6 mb-1">Histórico de solicitações</h2>
            <p class="text-muted small mb-0">Use as ações na última coluna para tomar uma decisão.</p>
          </div>
          <button class="btn btn-sm btn-outline-primary" onclick="carregarTransacoes()">
            <i class="bi bi-arrow-clockwise me-1"></i>Atualizar
          </button>
        </div>
        <div class="table-responsive">
          <table class="table align-middle mb-0" id="transacoes-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Cliente</th>
                <th>Valor / Pontos</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody id="transacoes-table-body"><tr><td colspan="7" class="text-center py-5 text-muted">Carregando solicitações...</td></tr></tbody>
          </table>
        </div>
      </div>
    </div>
    ${getMainFooter()}
  `;
}
