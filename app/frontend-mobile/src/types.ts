// =============================================================
// Tipos TypeScript que espelham os modelos do backend Django
// =============================================================

/** Estabelecimento (loja parceira) */
export interface Estabelecimento {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
  descricao: string;
  logotipo: string | null;
  cnpj: string;
  horario_funcionamento: Record<string, string>;
}

/** Produto de um estabelecimento */
export interface Produto {
  id: number;
  estabelecimento: number;
  estabelecimento_nome: string;
  estabelecimento_logo: string | null;
  nome: string;
  descricao: string;
  imagem: string | null;
  pontos: number;
}

/** Dados do usuário logado (cliente) retornados por GET /api/me/ */
export interface UserData {
  id: number;
  email: string;
  nome: string;
  cpf: string;
  telefone: string | null;
  pontos: number;
}

/** Par de tokens JWT */
export interface AuthTokens {
  access: string;
  refresh: string;
}

/** Dados para cadastro de cliente */
export interface RegisterData {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  password: string;
  password2: string;
}

/** Status possíveis do ticket de crédito */
export type TicketCreditoStatus = "ABERTO" | "CONCLUIDO" | "CANCELADO" | "RECUSADO";

/** Status possíveis do ticket de débito */
export type TicketDebitoStatus = "ABERTO" | "APROVADO" | "CONCLUIDO" | "CANCELADO" | "RECUSADO";

/** Ticket de crédito (Acúmulo de Pontos) */
export interface TicketCredito {
  id: number;
  cliente: number;
  nome_cliente: string;
  estabelecimento: number;
  nome_estabelecimento: string;
  logo_estabelecimento: string | null;
  codigo: string;
  status: TicketCreditoStatus;
  preco: string;
  pontos: number | null;
  data_nota: string;
  numero_nota: string;
  observacao: string | null;
  imagem: string | null;
  created_at: string;
  updated_at: string;
}

/** Ticket de débito (Resgate de Pontos) */
export interface TicketDebito {
  id: number;
  cliente: number;
  nome_cliente: string;
  produto: number;
  nome_produto: string;
  descricao_produto: string;
  imagem_produto: string | null;
  nome_estabelecimento: string | null;
  logo_estabelecimento: string | null;
  estabelecimento: number;
  codigo: string;
  status: TicketDebitoStatus;
  pontos: number;
  observacao: string | null;
  created_at: string;
  updated_at: string;
}

/** Tipo unificado para exibir transações na lista */
export type Transacao =
  | (TicketCredito & { tipo: "credito" })
  | (TicketDebito & { tipo: "debito" });
