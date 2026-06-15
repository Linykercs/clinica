/**
 * models/05_historico_reagendamentos.js — Histórico de alterações de horário.
 *
 * Registra cada vez que um agendamento troca de horário.
 * Permite auditoria e rastreamento do limite de 2 reagendamentos por paciente.
 *
 * Campos:
 *   agendamento_id      - Referência ao Agendamento alterado
 *   horario_anterior_id - Slot anterior (liberado após o reagendamento)
 *   horario_novo_id     - Slot novo (ocupado após o reagendamento)
 *   motivo              - Justificativa informada pelo paciente (opcional)
 *
 * Timestamp: reagendado_em (criado_em); sem atualizado_em pois é imutável.
 */

const mongoose = require("mongoose");

const historicoSchema = new mongoose.Schema({
  agendamento_id:      { type: mongoose.Schema.Types.ObjectId, ref: "Agendamento", required: true },
  horario_anterior_id: { type: mongoose.Schema.Types.ObjectId, ref: "HorarioDisponivel", required: true },
  horario_novo_id:     { type: mongoose.Schema.Types.ObjectId, ref: "HorarioDisponivel", required: true },
  motivo:              { type: String, trim: true },
}, { timestamps: { createdAt: "reagendado_em", updatedAt: false } });

module.exports = mongoose.model("HistoricoReagendamento", historicoSchema);