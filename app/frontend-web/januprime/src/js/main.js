import "bootstrap/dist/css/bootstrap.min.css";
import "../css/style.css";

import * as bootstrap from "bootstrap";
import { showPage } from "./utils/navigation.js";
import { showNotification } from "./utils/notifications.js";
import { authService, requireAuth, logout } from "./services/auth.js";
import { updateUIBasedOnAuth } from "./utils/auth-ui.js";
import { salvarPerfil } from "./pages/perfil-tcc.js";
import {
  editarProduto,
  excluirProduto,
  abrirModalProduto,
  salvarProdutoDashboard,
} from "./pages/catalogo.js";
import {
  aplicarFiltrosTransacoesAuto,
  limparFiltrosTransacoes,
  aprovarTransacao,
  rejeitarTransacao,
  visualizarTransacao,
} from "./pages/transacoes.js";

window.bootstrap = bootstrap;

document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
  updateUIBasedOnAuth();

  if (authService.isAuthenticated) {
    const savedPage = localStorage.getItem("currentPage");
    const availablePages = ["dashboard", "transacoes", "catalogo", "perfil"];
    const pageToLoad = availablePages.includes(savedPage) ? savedPage : "dashboard";
    showPage(pageToLoad);
  } else {
    localStorage.removeItem("currentPage");
    showPage("login");
  }

  const tooltipTriggerList = [...document.querySelectorAll('[data-bs-toggle="tooltip"]')];
  tooltipTriggerList.forEach((element) => new bootstrap.Tooltip(element));
}

window.showPage = showPage;
window.showNotification = showNotification;
window.salvarPerfil = salvarPerfil;

window.abrirModalProduto = abrirModalProduto;
window.salvarProdutoDashboard = salvarProdutoDashboard;
window.editarProduto = editarProduto;
window.excluirProduto = excluirProduto;

window.visualizarTransacao = visualizarTransacao;
window.aprovarTransacao = aprovarTransacao;
window.rejeitarTransacao = rejeitarTransacao;
window.aplicarFiltrosTransacoesAuto = aplicarFiltrosTransacoesAuto;
window.limparFiltrosTransacoes = limparFiltrosTransacoes;

window.logout = logout;
window.authService = authService;
window.requireAuth = requireAuth;
