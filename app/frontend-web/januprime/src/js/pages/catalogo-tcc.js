import { getMainFooter } from '../components/main-footer.js';

/** Catálogo reduzido a nome, custo e disponibilidade da recompensa. */
export function getCatalogoContent() {
  setTimeout(() => {
    if (typeof window.carregarProdutos === 'function') window.carregarProdutos();
  }, 100);

  return `
    <div class="container-fluid mb-5">
      <div class="page-heading d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <span class="eyebrow">Programa de pontos</span>
          <h1 class="text-gradient mb-1">Recompensas</h1>
          <p class="text-muted mb-0">Cadastre benefícios simples para os clientes resgatarem.</p>
        </div>
        <button class="btn btn-primary" onclick="abrirModalProduto()">
          <i class="bi bi-plus-lg me-2"></i>Nova recompensa
        </button>
      </div>
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <div>
            <h2 class="h6 mb-1">Recompensas cadastradas</h2>
            <p class="text-muted small mb-0">O custo é definido diretamente em pontos.</p>
          </div>
          <span class="badge bg-primary-subtle text-primary">Catálogo</span>
        </div>
        <div class="card-body">
          <div class="row g-3" id="produtos-container">
            <div class="col-12 text-center py-5">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="mt-3 text-muted">Carregando recompensas...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    ${getMainFooter()}
  `;
}
