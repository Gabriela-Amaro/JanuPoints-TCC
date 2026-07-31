// Elementos compartilhados das telas de autenticação da versão acadêmica.
export function getAuthNavbar() {
  return `
    <nav class="navbar navbar-dark auth-navbar">
      <div class="container-fluid px-4">
        <div class="navbar-brand d-flex align-items-center">
          <img src="/assets/images/logo.svg" alt="Logo JanuPoints" width="30" height="30" class="me-2">
          <span class="fw-bold">JanuPoints</span>
        </div>
      </div>
    </nav>
  `;
}

export function getAuthFooter() {
  return `
    <footer class="auth-footer py-4">
      <div class="container text-center">
        <p class="text-muted small mb-1">JanuPoints — programa de fidelização local</p>
        <p class="text-muted small mb-0">Protótipo acadêmico desenvolvido para o TCC.</p>
      </div>
    </footer>
  `;
}

window.getAuthNavbar = getAuthNavbar;
