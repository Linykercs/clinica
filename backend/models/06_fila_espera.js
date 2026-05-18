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