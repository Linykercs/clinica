// Model de agendamento do paciente
// Ciclo de status: pendente → confirmado → concluido / cancelado
const mongoose = require("mongoose");

const agendamentoSchema = new mongoose.Schema({
  horario_id:           { type: mongoose.Schema.Types.ObjectId, ref: "HorarioDisponivel", required: true },
  paciente_nome:        { type: String, required: true, trim: true },
  paciente_email:       { type: String, required: true, lowercase: true, trim: true },
  paciente_telefone:    { type: String, required: true, trim: true },
  status:               { type: String, enum: ["pendente","confirmado","concluido","cancelado"], default: "pendente" },
  reagendamentos_count: { type: Number, default: 0, max: 2 }, // limite de 2 reagendamentos por paciente
  origem:               { type: String, enum: ["site","admin"], default: "site" },
  observacoes:          { type: String, trim: true },
}, { timestamps: { createdAt: "criado_em", updatedAt: "atualizado_em" } });

module.exports = mongoose.model("Agendamento", agendamentoSchema);
