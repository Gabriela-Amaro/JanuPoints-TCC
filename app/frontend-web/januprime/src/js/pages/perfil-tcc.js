import { getMainFooter } from '../components/main-footer.js';
import { APP_CONFIG } from '../config/app.js';
import { estabelecimentosService } from '../services/estabelecimentos.js';
import { showNotification } from '../utils/notifications.js';

let estabelecimentoAtual = null;

function getLogotipoUrl(logotipoPath) {
  if (!logotipoPath) return null;
  if (logotipoPath.startsWith('http://') || logotipoPath.startsWith('https://')) {
    return logotipoPath;
  }

  const baseUrl = APP_CONFIG.apiUrl.replace('/api', '');
  if (logotipoPath.startsWith('/media/')) return `${baseUrl}${logotipoPath}`;
  if (logotipoPath.startsWith('media/')) return `${baseUrl}/${logotipoPath}`;
  if (logotipoPath.startsWith('logotipos/')) return `${baseUrl}/media/${logotipoPath}`;
  return `${baseUrl}/media/${logotipoPath.replace(/^\//, '')}`;
}

function atualizarPreview() {
  const previewNome = document.getElementById('previewNome');
  const previewEndereco = document.getElementById('previewEndereco');
  const previewDescricao = document.getElementById('previewDescricao');

  if (previewNome) {
    previewNome.textContent = document.getElementById('empresaNome')?.value.trim() || 'Nome do estabelecimento';
  }
  if (previewEndereco) {
    previewEndereco.textContent = document.getElementById('empresaEndereco')?.value.trim() || 'Endereço não informado';
  }
  if (previewDescricao) {
    previewDescricao.textContent = document.getElementById('empresaDescricao')?.value.trim() || 'Descrição do estabelecimento';
  }
}

function exibirLogo(src) {
  const container = document.getElementById('previewLogoContainer');
  if (!container) return;

  if (src) {
    container.innerHTML = `<img src="${src}" alt="Logo do estabelecimento" class="establishment-preview-logo">`;
  } else {
    container.innerHTML = `
      <div class="establishment-preview-placeholder">
        <i class="bi bi-building"></i>
      </div>
    `;
  }
}

function atualizarPreviewLogo(event) {
  const file = event.target.files?.[0];
  if (!file) {
    exibirLogo(getLogotipoUrl(estabelecimentoAtual?.logotipo));
    return;
  }

  if (!file.type.startsWith('image/')) {
    event.target.value = '';
    showNotification('Selecione um arquivo de imagem.', 'error');
    return;
  }

  exibirLogo(URL.createObjectURL(file));
}

window.atualizarPreview = atualizarPreview;
window.atualizarPreviewLogo = atualizarPreviewLogo;

async function carregarEstabelecimento() {
  try {
    estabelecimentoAtual = await estabelecimentosService.obterMeuEstabelecimento();
    const campos = {
      empresaNome: estabelecimentoAtual.nome,
      empresaEndereco: estabelecimentoAtual.endereco,
      empresaTelefone: estabelecimentoAtual.telefone,
      empresaDescricao: estabelecimentoAtual.descricao,
    };

    Object.entries(campos).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (input && value) input.value = value;
    });

    atualizarPreview();
    exibirLogo(getLogotipoUrl(estabelecimentoAtual.logotipo));
  } catch (error) {
    console.error('Erro ao carregar dados do estabelecimento:', error);
    showNotification('Não foi possível carregar os dados do estabelecimento.', 'error');
  }
}

export async function salvarPerfil() {
  if (!estabelecimentoAtual?.id) {
    showNotification('Estabelecimento não encontrado.', 'error');
    return;
  }

  const logoInput = document.getElementById('empresaLogo');
  const dados = {
    nome: document.getElementById('empresaNome')?.value.trim(),
    endereco: document.getElementById('empresaEndereco')?.value.trim(),
    telefone: document.getElementById('empresaTelefone')?.value.trim(),
    descricao: document.getElementById('empresaDescricao')?.value.trim(),
  };

  const button = document.querySelector('[data-save-profile]');
  if (button) {
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';
  }

  try {
    estabelecimentoAtual = await estabelecimentosService.atualizar(estabelecimentoAtual.id, dados);

    const logo = logoInput?.files?.[0];
    if (logo) {
      estabelecimentoAtual = await estabelecimentosService.atualizarComLogotipo(
        estabelecimentoAtual.id,
        logo
      );
    }

    atualizarPreview();
    exibirLogo(getLogotipoUrl(estabelecimentoAtual.logotipo));
    if (logoInput) logoInput.value = '';
    showNotification('Perfil salvo com sucesso!', 'success');
  } catch (error) {
    console.error('Erro ao salvar dados do estabelecimento:', error);
    showNotification('Não foi possível salvar os dados do perfil.', 'error');
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = '<i class="bi bi-check-lg me-2"></i>Salvar informações';
    }
  }
}

/** Perfil básico com logo e visualização do cartão exibido ao cliente. */
export function getPerfilContent() {
  setTimeout(carregarEstabelecimento, 100);

  return `
    <div class="container-fluid mb-5">
      <div class="page-heading mb-4">
        <span class="eyebrow">Estabelecimento parceiro</span>
        <h1 class="text-gradient mb-1">Dados do estabelecimento</h1>
        <p class="text-muted mb-0">Mantenha as informações básicas exibidas aos clientes.</p>
      </div>
      <div class="row g-4">
        <div class="col-lg-7">
          <div class="card">
            <div class="card-header"><h2 class="h6 mb-0">Informações principais</h2></div>
            <div class="card-body">
              <div class="mb-3">
                <label for="empresaNome" class="form-label">Nome do estabelecimento</label>
                <input class="form-control" id="empresaNome" oninput="atualizarPreview()" required>
              </div>
              <div class="mb-3">
                <label for="empresaEndereco" class="form-label">Endereço</label>
                <input class="form-control" id="empresaEndereco" oninput="atualizarPreview()" placeholder="Rua, número, bairro e cidade">
              </div>
              <div class="mb-3">
                <label for="empresaTelefone" class="form-label">Telefone</label>
                <input class="form-control" id="empresaTelefone" placeholder="(00) 00000-0000">
              </div>
              <div class="mb-3">
                <label for="empresaDescricao" class="form-label">Descrição breve</label>
                <textarea class="form-control" id="empresaDescricao" rows="3" oninput="atualizarPreview()" placeholder="Como o estabelecimento participa do programa?"></textarea>
              </div>
              <div class="mb-4">
                <label for="empresaLogo" class="form-label">Logo do estabelecimento</label>
                <input class="form-control" type="file" id="empresaLogo" accept="image/png,image/jpeg,image/webp" onchange="atualizarPreviewLogo(event)">
                <div class="form-text">Use uma imagem quadrada em PNG, JPG ou WEBP.</div>
              </div>
              <button type="button" class="btn btn-primary" data-save-profile onclick="salvarPerfil()">
                <i class="bi bi-check-lg me-2"></i>Salvar informações
              </button>
            </div>
          </div>
        </div>
        <div class="col-lg-5">
          <div class="card h-100 establishment-preview-card">
            <div class="card-header">
              <span class="eyebrow text-primary">Pré-visualização</span>
              <h2 class="h6 mb-0 mt-1">Como o cliente verá o parceiro</h2>
            </div>
            <div class="card-body p-4">
              <div id="previewLogoContainer" class="mb-3">
                <div class="establishment-preview-placeholder"><i class="bi bi-building"></i></div>
              </div>
              <h3 id="previewNome" class="establishment-preview-name">Nome do estabelecimento</h3>
              <p id="previewDescricao" class="establishment-preview-description">Descrição do estabelecimento</p>
              <div class="establishment-preview-detail">
                <i class="bi bi-geo-alt"></i>
                <span id="previewEndereco">Endereço não informado</span>
              </div>
              <div class="establishment-preview-detail">
                <i class="bi bi-award"></i>
                <span>Parceiro do programa de pontos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    ${getMainFooter()}
  `;
}
