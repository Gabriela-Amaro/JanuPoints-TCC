// Sistema de navegação
export function showPage(pageName) {
  const content = document.getElementById('page-content');
  
  // Verificar se é uma página que requer autenticação
  const protectedPages = ['dashboard', 'perfil', 'catalogo', 'transacoes'];
  
  if (protectedPages.includes(pageName)) {
    // Verificar autenticação
    if (typeof requireAuth === 'function' && !requireAuth(pageName)) {
      return; // requireAuth já redireciona se necessário
    }
  }
  
  // Se for página de auth e usuário já estiver logado, redirecionar para dashboard
  if ((['login', 'forgot-password'].includes(pageName)) && typeof authService !== 'undefined' && authService.isAuthenticated) {
    showPage('dashboard');
    return;
  }
  
  // Salvar página atual no localStorage (apenas para páginas protegidas)
  if (protectedPages.includes(pageName)) {
    localStorage.setItem('currentPage', pageName);
  } else if (['login', 'forgot-password'].includes(pageName)) {
    // Limpar página salva ao acessar páginas de autenticação
    localStorage.removeItem('currentPage');
  }
  
  // Remove classe ativa de todos os links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Remove classe ativa de todos os dropdown items
  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Adiciona classe ativa ao link atual (apenas se não for página de auth)
  if (!['login', 'forgot-password'].includes(pageName)) {
    const activeLink = document.querySelector(`[onclick="showPage('${pageName}')"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
    
    // Adiciona classe ativa ao dropdown item correspondente
    const activeDropdownItem = document.querySelector(`[onclick="showPage('${pageName}')"].dropdown-item`);
    if (activeDropdownItem) {
      activeDropdownItem.classList.add('active');
    }
  }
  
  // Desconectar SSE de tickets ao sair do dashboard
  if (typeof window.desconectarTicketStream === 'function') {
    window.desconectarTicketStream();
  }

  // Carrega o conteúdo da página
  content.innerHTML = getPageContent(pageName);
  content.classList.add('fade-in-up');
  

  // Carrega dados assíncronos para páginas específicas
  if (pageName === 'dashboard') {
    setTimeout(() => {
      carregarDadosDashboardTcc();
    }, 0);
  }
  
  // Carregar produtos quando acessar a página de catálogo
  if (pageName === 'catalogo' && typeof window.carregarProdutos === 'function') {
    setTimeout(() => {
      window.carregarProdutos();
    }, 100);
  }
  
  // Fecha o offcanvas se estiver aberto
  const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasNavbar'));
  if (offcanvas) {
    offcanvas.hide();
  }
}

// Gera o conteúdo das páginas
function getPageContent(pageName) {
  switch (pageName) {
    case 'login':
      return getLoginContent();

    case 'forgot-password':
      return getForgotPasswordContent();
    case 'dashboard':
      return getDashboardContent();
    case 'perfil':
      return getPerfilContent();
    case 'catalogo':
      return getCatalogoContent();
    case 'transacoes':
      return getTransacoesContent();
    default:
      return getLoginContent(); // Página padrão agora é login
  }
}

// Importar funções de geração de conteúdo das páginas
import { getLoginContent } from '../pages/login.js';

import { getForgotPasswordContent } from '../pages/forgot-password.js';
import { getDashboardContent, carregarDadosDashboardTcc } from '../pages/dashboard-tcc.js';
import { getPerfilContent } from '../pages/perfil-tcc.js';
import { getCatalogoContent } from '../pages/catalogo-tcc.js';
import { getTransacoesContent } from '../pages/transacoes-tcc.js';
