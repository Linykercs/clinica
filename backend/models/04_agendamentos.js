/**
 * models/04_agendamentos.js — Agendamentos de pacientes.
 *
 * Ciclo de vida do status:
 *   pendente → confirmado → concluido
 *            ↘ cancelado  (em qualquer etapa)
 *
 * Campos:
 *   horario_id          - Referência ao slot reservado (HorarioDisponivel)
 *   paciente_nome       - Nome completo do paciente
 *   paciente_email      - E-mail para comunicação (lowercase)
 *   paciente_telefone   - Telefone/WhatsApp
 *   status              - pendente | confirmado | concluido | cancelado
 *   reagendamentos_count- Contador de reagendamentos (máx 2 por regra de negócio)
 *   origem              - "site" (paciente) ou "admin" (criado pelo painel)
 *   observacoes         - Informações adicionais do paciente (opcional)
 *
 * Timestamps: criado_em, atualizado_em
 */

const mongoose = require("mongoose");

const agendamentoSchema = new mongoose.Schema({
  horario_id:         { type: mongoose.Schema.Types.ObjectId, ref: "HorarioDisponivel", required: true },
  paciente_nome:      { type: String, required: true, trim: true },
  paciente_email:     { type: String, required: true, lowercase: true, trim: true },
  paciente_telefone:  { type: String, required: true, trim: true },
  status:             { type: String, enum: ["pendente","confirmado","concluido","cancelado"], default: "pendente" },
  reagendamentos_count: { type: Number, default: 0, max: 2 },
  origem:             { type: String, enum: ["site","admin"], default: "site" },
  observacoes:        { type: String, trim: true },
}, { timestamps: { createdAt: "criado_em", updatedAt: "atualizado_em" } });

module.exports = mongoose.model("Agendamento", agendamentoSchema);