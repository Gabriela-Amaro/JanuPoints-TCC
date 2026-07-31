import { showNotification } from '../utils/notifications.js';
import { produtosService } from '../services/produtos.js';
import { APP_CONFIG } from '../config/app.js';



/**
 * Constrói URL completa da imagem do produto
 */
function getImagemUrl(imagemPath) {
  if (!imagemPath) {
    return null;
  }

  if (imagemPath.startsWith('http://') || imagemPath.startsWith('https://')) {
    return imagemPath;
  }

  const baseUrl = APP_CONFIG.apiUrl.replace('/api', '');

  if (imagemPath.startsWith('/media/')) {
    return `${baseUrl}${imagemPath}`;
  }

  if (imagemPath.startsWith('media/')) {
    return `${baseUrl}/${imagemPath}`;
  }

  if (imagemPath.startsWith('produtos/')) {
    return `${baseUrl}/media/${imagemPath}`;
  }

  const mediaPath = imagemPath.startsWith('/') ? imagemPath : `/${imagemPath}`;
  return `${baseUrl}/media${mediaPath}`;
}

async function carregarProdutos() {
  try {
    const response = await produtosService.listar();
    const produtos = Array.isArray(response) ? response : response.results || [];
    atualizarExibicaoProdutos(produtos);
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    showNotification('Erro ao carregar produtos', 'error');
    const container = document.getElementById('produtos-container');
    if (container) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="bi bi-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
          <h5 class="mt-3 text-muted">Erro ao carregar produtos</h5>
          <p class="text-muted">Tente recarregar a página.</p>
        </div>
      `;
    }
  }
}

export function abrirModalProduto() {
  const nomeInput = document.getElementById('produtoNome');
  const descricaoInput = document.getElementById('produtoDescricao');
  const precoInput = document.getElementById('produtoPreco');
  const ativoCheckbox = document.getElementById('produtoAtivo');
  const imagemInput = document.getElementById('produtoImagem');
  const modalTitle = document.getElementById('produtoModalLabel');

  if (nomeInput) nomeInput.value = '';
  if (descricaoInput) descricaoInput.value = '';
  if (precoInput) precoInput.value = '';
  if (imagemInput) imagemInput.value = '';
  if (ativoCheckbox) ativoCheckbox.checked = true;
  if (modalTitle) modalTitle.textContent = 'Adicionar recompensa';

  window.produtoEditandoId = null;

  const modalElement = document.getElementById('produtoModal');
  if (modalElement) {
    const modal = window.bootstrap.Modal.getInstance(modalElement) || new window.bootstrap.Modal(modalElement);
    modal.show();
  }
}

export async function salvarProdutoDashboard() {
  const nomeInput = document.getElementById('produtoNome');
  const descricaoInput = document.getElementById('produtoDescricao');
  const precoInput = document.getElementById('produtoPreco');
  const ativoCheckbox = document.getElementById('produtoAtivo');
  const imagemInput = document.getElementById('produtoImagem');

  const nome = nomeInput?.value.trim();
  const descricao = descricaoInput?.value.trim() || '';
  const precoVal = precoInput?.value;
  const ativo = ativoCheckbox ? ativoCheckbox.checked : true;

  if (!nome) {
    showNotification('Por favor, preencha o nome da recompensa.', 'warning');
    return;
  }

  if (!precoVal || isNaN(parseFloat(precoVal)) || parseFloat(precoVal) <= 0) {
    showNotification('Por favor, defina um valor válido em reais (R$).', 'warning');
    return;
  }

  const dados = {
    nome,
    descricao,
    preco: parseFloat(precoVal),
    ativo,
  };

  const imagemFile = imagemInput?.files?.[0];

  try {
    const id = window.produtoEditandoId;
    if (id) {
      if (imagemFile) {
        await produtosService.atualizarComImagem(id, dados, imagemFile);
      } else {
        await produtosService.atualizar(id, dados);
      }
      showNotification('Recompensa atualizada com sucesso!', 'success');
    } else {
      if (imagemFile) {
        await produtosService.criarComImagem(dados, imagemFile);
      } else {
        await produtosService.criar(dados);
      }
      showNotification('Recompensa cadastrada com sucesso!', 'success');
    }

    const modalElement = document.getElementById('produtoModal');
    if (modalElement) {
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }

    if (typeof window.carregarProdutos === 'function') {
      await window.carregarProdutos();
    }
  } catch (error) {
    console.error('Erro ao salvar recompensa:', error);
    showNotification(`Erro ao salvar recompensa: ${error.message || 'Erro no servidor'}`, 'error');
  }
}

export async function editarProduto(id) {
  try {
    const produto = await produtosService.obter(id);
    const nomeInput = document.getElementById('produtoNome');
    const descricaoInput = document.getElementById('produtoDescricao');
    const precoInput = document.getElementById('produtoPreco');
    const ativoCheckbox = document.getElementById('produtoAtivo');
    const imagemInput = document.getElementById('produtoImagem');
    const modalTitle = document.getElementById('produtoModalLabel');

    if (nomeInput) nomeInput.value = produto.nome || '';
    if (descricaoInput) descricaoInput.value = produto.descricao || '';
    if (precoInput) precoInput.value = produto.preco ? parseFloat(produto.preco) : (produto.pontos || '');
    if (imagemInput) imagemInput.value = '';
    if (ativoCheckbox) ativoCheckbox.checked = produto.ativo !== false;
    if (modalTitle) modalTitle.textContent = 'Editar Recompensa';

    window.produtoEditandoId = id;

    const modalElement = document.getElementById('produtoModal');
    if (modalElement) {
      const modal = window.bootstrap.Modal.getInstance(modalElement) || new window.bootstrap.Modal(modalElement);
      modal.show();
    }
  } catch (error) {
    console.error('Erro ao carregar produto para edição:', error);
    showNotification('Erro ao carregar dados do produto', 'error');
  }
}

export async function excluirProduto(id) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;

  try {
    await produtosService.remover(id);
    showNotification('Produto removido com sucesso!', 'success');
    await carregarProdutos();
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    showNotification(`Erro ao excluir produto: ${error.message || 'Erro desconhecido'}`, 'error');
  }
}

window.carregarProdutos = carregarProdutos;
window.abrirModalProduto = abrirModalProduto;
window.salvarProdutoDashboard = salvarProdutoDashboard;

function atualizarExibicaoProdutos(produtos) {
  const container = document.getElementById('produtos-container');

  if (!container) {
    console.error('Container de produtos não encontrado');
    return;
  }

  if (produtos.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
        <h5 class="mt-3 text-muted">Nenhum produto encontrado!</h5>
        <p class="text-muted">Cadastre uma recompensa para exibi-la aqui.</p>
      </div>
    `;
    return;
  }

  const html = produtos.map((produto) => {
    const temImagem = produto.imagem && produto.imagem.trim() !== '';
    const imagemUrl = temImagem ? getImagemUrl(produto.imagem) : null;
    const descricao = produto.descricao || 'Sem descrição';
    const pontos = produto.pontos || 0;

    return `
      <div class="col-lg-3 col-md-4 col-sm-6 mb-3">
        <div class="card h-100 shadow-sm product-card">
          <div class="card-img-top-container" style="aspect-ratio: 1; overflow: hidden; background-color: #333; display: flex; align-items: center; justify-content: center; position: relative;">
            ${temImagem ? `
              <img src="${imagemUrl}" alt="${produto.nome}" class="card-img-top" style="object-fit: cover; width: 100%; height: 100%;">
            ` : `
              <i class="bi bi-image text-muted" style="font-size: 3rem; opacity: 0.5;"></i>
            `}
          </div>
          <div class="card-body d-flex flex-column" style="padding: 1rem;">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title mb-0 text-dark" style="font-size: 1.15rem; font-weight: 700;">${produto.nome}</h5>
              <span class="badge ${produto.ativo ? 'bg-success' : 'bg-secondary'}" style="font-size: 0.7rem;">
                ${produto.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <p class="card-text text-muted flex-grow-1" style="min-height: 35px; font-size: 0.95rem; margin-bottom: 0.75rem;">${descricao}</p>
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <span class="fw-bold text-dark mb-0" style="font-size: 1rem;">
                <i class="bi bi-star-fill text-warning me-1"></i>${pontos} pontos
              </span>
              <div>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editarProduto(${produto.id})" title="Editar" style="padding: 0.25rem 0.5rem;">
                  <i class="bi bi-pencil" style="font-size: 0.85rem;"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="excluirProduto(${produto.id})" title="Excluir" style="padding: 0.25rem 0.5rem;">
                  <i class="bi bi-trash" style="font-size: 0.85rem;"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}
