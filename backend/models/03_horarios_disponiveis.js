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