/**
 * api.js — Cliente HTTP centralizado para comunicação com o backend.
 *
 * Todas as páginas do frontend importam este arquivo para fazer chamadas
 * à API REST hospedada no Railway. O token JWT do admin é injetado
 * automaticamente quando presente no localStorage.
 */

const API_URL = "https://clinica-production-3c98.up.railway.app/api";

/**
 * Função base de requisição. Injeta Content-Type e Authorization (se logado),
 * depois lança um Error com a mensagem do backend em caso de resposta não-ok.
 * @param {string} path - Caminho relativo ao API_URL (ex: "/servicos")
 * @param {RequestInit} options - Opções extras do fetch (method, body, etc.)
 * @returns {Promise<any>} JSON retornado pelo servidor
 */
async function req(path, options = {}) {
  const token = localStorage.getItem("token_admin");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || "Erro na requisição");
  return data;
}

/**
 * Objeto com todos os endpoints disponíveis, agrupados por domínio.
 *
 * Rotas públicas (não exigem token):
 *   getServicos, getHorarios, criarAgendamento, entrarFila, chatbot, enviarContato
 *
 * Rotas de admin (exigem token JWT via header Authorization):
 *   login, getDashboard, getAgendamentos, atualizarStatus, criarHorarios, getContatos
 */
const API = {
  // ── Público ──────────────────────────────────────────────────────────────
  /** Retorna lista de serviços ativos. */
  getServicos: () => req("/servicos"),

  /**
   * Retorna horários disponíveis para um serviço em uma data.
   * @param {string} data - Data no formato YYYY-MM-DD
   * @param {string} servicoId - ObjectId do serviço
   */
  getHorarios: (data, servicoId) => req(`/horarios?data=${data}&servico=${servicoId}`),

  /**
   * Cria um novo agendamento para um paciente.
   * @param {{ horario_id, paciente_nome, paciente_email, paciente_telefone, observacoes }} body
   */
  criarAgendamento: (body) => req("/agendamentos", { method: "POST", body: JSON.stringify(body) }),

  /**
   * Reagenda um agendamento existente para outro horário.
   * @param {string} id - ObjectId do agendamento
   * @param {{ horario_id, motivo }} body
   */
  reagendar: (id, body) => req(`/agendamentos/${id}/reagendar`, { method: "POST", body: JSON.stringify(body) }),

  /**
   * Cancela um agendamento. Libera o horário e notifica o próximo na fila.
   * @param {string} id - ObjectId do agendamento
   */
  cancelar: (id) => req(`/agendamentos/${id}/cancelar`, { method: "POST" }),

  /**
   * Insere o paciente na fila de espera de um horário ocupado.
   * @param {string} horarioId - ObjectId do horário
   * @param {{ paciente_nome, paciente_email, paciente_telefone }} body
   */
  entrarFila: (horarioId, body) => req(`/agendamentos/${horarioId}/fila`, { method: "POST", body: JSON.stringify(body) }),

  /**
   * Consulta o chatbot com uma pergunta em texto livre.
   * O backend busca palavras-chave nas FAQs cadastradas.
   * @param {string} pergunta
   */
  chatbot: (pergunta) => req(`/chatbot?pergunta=${encodeURIComponent(pergunta)}`),

  /**
   * Envia uma mensagem pelo formulário de contato.
   * @param {{ nome, email, assunto, mensagem }} body
   */
  enviarContato: (body) => req("/contatos", { method: "POST", body: JSON.stringify(body) }),

  // ── Admin (requer JWT) ────────────────────────────────────────────────────
  /**
   * Autentica o administrador e retorna o token JWT (validade 8h).
   * @param {string} email
   * @param {string} senha
   */
  login: (email, senha) => req("/admin/login", { method: "POST", body: JSON.stringify({ email, senha }) }),

  /** Retorna contadores do dashboard: total, pendentes, confirmados, hoje, contatos não respondidos. */
  getDashboard: () => req("/admin/dashboard"),

  /**
   * Lista agendamentos, com filtro opcional por status.
   * @param {string} [status] - "pendente" | "confirmado" | "concluido" | "cancelado"
   */
  getAgendamentos: (status) => req(`/admin/agendamentos${status ? `?status=${status}` : ""}`),

  /**
   * Atualiza o status de um agendamento (PATCH).
   * @param {string} id - ObjectId do agendamento
   * @param {string} status - Novo status
   */
  atualizarStatus: (id, status) => req(`/admin/agendamentos/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),

  /**
   * Cria slots de horários disponíveis em lote para um serviço.
   * @param {{ servico_id, data, slots: string[], duracao_min }} body
   */
  criarHorarios: (body) => req("/admin/horarios", { method: "POST", body: JSON.stringify(body) }),

  /** Lista todas as mensagens de contato recebidas, ordenadas por data desc. */
  getContatos: () => req("/admin/contatos"),
};
