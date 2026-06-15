// Model de servico oferecido pela clinica
const mongoose = require("mongoose");

const servicoSchema = new mongoose.Schema(
  {
    nome:        { type: String, required: true, trim: true },
    descricao:   { type: String, trim: true },
    duracao_min: { type: Number, required: true, min: 15 }, // usado para calcular hora_fim dos slots
    ativo:       { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "criado_em", updatedAt: "atualizado_em" } }
);

module.exports = mongoose.model("Servico", servicoSchema);
