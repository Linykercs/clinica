/**
 * models/03_horarios_disponiveis.js — Slots de horário para agendamento.
 *
 * Cada documento representa um único slot de atendimento para um serviço.
 * O campo `ocupado` é alterado atomicamente via findOneAndUpdate no momento
 * do agendamento para evitar race conditions (double-booking).
 *
 * Campos:
 *   servico_id  - Referência ao Servico (populate: nome, duracao_min)
 *   data        - Data do atendimento (armazenada como Date UTC)
 *   hora_inicio - "HH:MM" — hora de início do slot
 *   hora_fim    - "HH:MM" — hora de término (calculada em POST /admin/horarios)
 *   ocupado     - true enquanto houver um agendamento ativo para este slot
 *
 * Timestamps: criado_em, atualizado_em
 */

const mongoose = require("mongoose");

const horarioDisponivelSchema = new mongoose.Schema(
  {
    servico_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Servico", required: true },
    data:        { type: Date, required: true },
    hora_inicio: { type: String, required: true },
    hora_fim:    { type: String, required: true },
    ocupado:     { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "criado_em", updatedAt: "atualizado_em" } }
);

module.exports = mongoose.model("HorarioDisponivel", horarioDisponivelSchema);