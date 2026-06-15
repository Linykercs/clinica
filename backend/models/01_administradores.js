// Model de administrador do painel
const mongoose = require("mongoose");

const administradorSchema = new mongoose.Schema(
  {
    nome:          { type: String, required: true, trim: true },
    email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    senha_hash:    { type: String, required: true }, // hash bcrypt, nunca senha em texto
    ativo:         { type: Boolean, default: true },  // false = acesso bloqueado sem excluir
    ultimo_acesso: { type: Date, default: null },
  },
  { timestamps: { createdAt: "criado_em", updatedAt: "atualizado_em" } }
);

module.exports = mongoose.model("Administrador", administradorSchema);
