/**
 * models/06_fila_espera.js — Fila de espera para horários ocupados.
 *
 * Quando um slot está ocupado, o paciente pode entrar na fila.
 * Ao cancelar, o sistema notifica o primeiro da fila (menor posicao
 * com status "aguardando") e marca expira_em = agora + 2h.
 *
 * Ciclo de status:
 *   aguardando → notificado → confirmado  (paciente aceitou)
 *                           ↘ expirado    (2h sem resposta)
 *             ↘ desistiu    (paciente desistiu manualmente)
 *
 * Campos:
 *   horario_id        - Slot aguardado
 *   paciente_nome     - Nome do paciente na fila
 *   paciente_email    - E-mail para notificação
 *   paciente_telefone - Telefone de contato
 *   posicao           - Número inteiro crescente (1 = primeiro da fila)
 *   status            - aguardando | notificado | confirmado | expirado | desistiu
 *   notificado_em     - Quando o sistema avisou o paciente
 *   expira_em         - Prazo para o paciente confirmar (notificado_em + 2h)
 *
 * Timestamps: criado_em, atualizado_em
 */

const mongoose = require("mongoose");

const filaEsperaSchema = new mongoose.Schema({
  horario_id:        { type: mongoose.Schema.Types.ObjectId, ref: "HorarioDisponivel", required: true },
  paciente_nome:     { type: String, required: true, trim: true },
  paciente_email:    { type: String, required: true, lowercase: true, trim: true },
  paciente_telefone: { type: String, required: true, trim: true },
  posicao:           { type: Number, required: true, min: 1 },
  status:            { type: String, enum: ["aguardando","notificado","confirmado","expirado","desistiu"], default: "aguardando" },
  notificado_em:     { type: Date, default: null },
  expira_em:         { type: Date, default: null },
}, { timestamps: { createdAt: "criado_em", updatedAt: "atualizado_em" } });

module.exports = mongoose.model("FilaEspera", filaEsperaSchema);