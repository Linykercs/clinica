const API_URL = "https://clinica-production-3c98.up.railway.app/api";

// Funcao base de requisicao (injeta token JWT quando logado)
async function req(path, options = {}) {
  const token = localStorage.getItem("token_admin");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || "Erro na requisição");
  return data;
}

const API = {
  // Buscar lista de servicos
  getServicos: () => req("/servicos"),
  // Buscar horarios disponiveis por data e servico
  getHorarios: (data, servicoId) => req(`/horarios?data=${data}&servico=${servicoId}`),
  // Criar agendamento
  criarAgendamento: (body) => req("/agendamentos", { method: "POST", body: JSON.stringify(body) }),
  // Reagendar consulta
  reagendar: (id, body) => req(`/agendamentos/${id}/reagendar`, { method: "POST", body: JSON.stringify(body) }),
  // Cancelar agendamento
  cancelar: (id) => req(`/agendamentos/${id}/cancelar`, { method: "POST" }),
  // Entrar na fila de espera
  entrarFila: (horarioId, body) => req(`/agendamentos/${horarioId}/fila`, { method: "POST", body: JSON.stringify(body) }),
  // Enviar pergunta ao chatbot
  chatbot: (pergunta) => req(`/chatbot?pergunta=${encodeURIComponent(pergunta)}`),
  // Enviar mensagem de contato
  enviarContato: (body) => req("/contatos", { method: "POST", body: JSON.stringify(body) }),
  // Fazer login admin
  login: (email, senha) => req("/admin/login", { method: "POST", body: JSON.stringify({ email, senha }) }),
  // Buscar dados do dashboard
  getDashboard: () => req("/admin/dashboard"),
  // Listar agendamentos (admin)
  getAgendamentos: (status) => req(`/admin/agendamentos${status ? `?status=${status}` : ""}`),
  // Atualizar status do agendamento
  atualizarStatus: (id, status) => req(`/admin/agendamentos/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  // Cadastrar horarios disponiveis
  criarHorarios: (body) => req("/admin/horarios", { method: "POST", body: JSON.stringify(body) }),
  // Listar mensagens de contato (admin)
  getContatos: () => req("/admin/contatos"),
};
