// Model de mensagem de contato do site
const mongoose = require("mongoose");

const contatoSchema = new mongoose.Schema({
  nome:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, lowercase: true, trim: true },
  assunto:       { type: String, required: true, trim: true },
  mensagem:      { type: String, required: true, trim: true },
  respondido:    { type: Boolean, default: false },
  respondido_em: { type: Date, default: null },
}, { timestamps: { createdAt: "criado_em", updatedAt: "atualizado_em" } });

module.exports = mongoose.model("Contato", contatoSchema);
