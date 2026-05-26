const API_URL = "https://clinica-production-2032.up.railway.app/api";

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
  getServicos: () => req("/servicos"),
  getHorarios: (data, servicoId) => req(`/horarios?data=${data}&servico=${servicoId}`),
  criarAgendamento: (body) => req("/agendamentos", { method: "POST", body: JSON.stringify(body) }),
  reagendar: (id, body) => req(`/agendamentos/${id}/reagendar`, { method: "POST", body: JSON.stringify(body) }),
  cancelar: (id) => req(`/agendamentos/${id}/cancelar`, { method: "POST" }),
  entrarFila: (horarioId, body) => req(`/agendamentos/${horarioId}/fila`, { method: "POST", body: JSON.stringify(body) }),
  chatbot: (pergunta) => req(`/chatbot?pergunta=${encodeURIComponent(pergunta)}`),
  enviarContato: (body) => req("/contatos", { method: "POST", body: JSON.stringify(body) }),
  login: (email, senha) => req("/admin/login", { method: "POST", body: JSON.stringify({ email, senha }) }),
  getDashboard: () => req("/admin/dashboard"),
  getAgendamentos: (status) => req(`/admin/agendamentos${status ? `?status=${status}` : ""}`),
  atualizarStatus: (id, status) => req(`/admin/agendamentos/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  criarHorarios: (body) => req("/admin/horarios", { method: "POST", body: JSON.stringify(body) }),
  getContatos: () => req("/admin/contatos"),
};
