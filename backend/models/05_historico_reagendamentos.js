// Model de historico de reagendamentos (auditoria)
const mongoose = require("mongoose");

const historicoSchema = new mongoose.Schema({
  agendamento_id:      { type: mongoose.Schema.Types.ObjectId, ref: "Agendamento", required: true },
  horario_anterior_id: { type: mongoose.Schema.Types.ObjectId, ref: "HorarioDisponivel", required: true },
  horario_novo_id:     { type: mongoose.Schema.Types.ObjectId, ref: "HorarioDisponivel", required: true },
  motivo:              { type: String, trim: true },
}, { timestamps: { createdAt: "reagendado_em", updatedAt: false } });

module.exports = mongoose.model("HistoricoReagendamento", historicoSchema);
