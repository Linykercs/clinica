/**
 * models/00_index.js — Barrel de exportação de todos os modelos Mongoose.
 *
 * Importar daqui evita caminhos relativos duplicados nos routes:
 *   const { Agendamento, Servico } = require("../models");
 *
 * Ordem dos modelos reflete a hierarquia de dependências:
 *   Administrador → sem dependências
 *   Servico       → sem dependências
 *   HorarioDisponivel → ref Servico
 *   Agendamento   → ref HorarioDisponivel
 *   HistoricoReagendamento → ref Agendamento + HorarioDisponivel
 *   FilaEspera    → ref HorarioDisponivel
 *   ChatbotFaq    → sem dependências
 *   Contato       → sem dependências
 */

const Administrador          = require("./01_administradores");
const Servico                = require("./02_servicos");
const HorarioDisponivel      = require("./03_horarios_disponiveis");
const Agendamento            = require("./04_agendamentos");
const HistoricoReagendamento = require("./05_historico_reagendamentos");
const FilaEspera             = require("./06_fila_espera");
const ChatbotFaq             = require("./07_chatbot_faqs");
const Contato                = require("./08_contatos");

module.exports = {
  Administrador,
  Servico,
  HorarioDisponivel,
  Agendamento,
  HistoricoReagendamento,
  FilaEspera,
  ChatbotFaq,
  Contato,
};
