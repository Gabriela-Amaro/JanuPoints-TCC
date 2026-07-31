// Rodapé enxuto para as telas do painel.
export function getMainFooter() {
  return `
    <footer class="main-footer border-top mt-5 py-4">
      <div class="container-fluid d-flex flex-wrap justify-content-between gap-2">
        <span class="text-muted small">JanuPoints · Painel do estabelecimento</span>
        <span class="text-muted small">Versão 1.0.0</span>
      </div>
    </footer>
  `;
}

window.getMainFooter = getMainFooter;
