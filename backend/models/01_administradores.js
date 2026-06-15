/**
 * models/01_administradores.js — Administradores do painel.
 *
 * Campos:
 *   nome          - Nome de exibição no painel
 *   email         - Identificador único de login (lowercase)
 *   senha_hash    - Hash bcrypt — nunca armazenar senha em texto puro
 *   ativo         - false desativa o acesso sem excluir o registro (auditoria segura)
 *   ultimo_acesso - Atualizado a cada login bem-sucedido
 *
 * Timestamps: criado_em, atualizado_em
 */

const mongoose = require("mongoose");

const administradorSchema = new mongoose.Schema(
  {
    nome:          { type: String, required: true, trim: true },
    email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    senha_hash:    { type: String, required: true },
    ativo:         { type: Boolean, default: true },
    ultimo_acesso: { type: Date, default: null },
  },
  { timestamps: { createdAt: "criado_em", updatedAt: "atualizado_em" } }
);

module.exports = mongoose.model("Administrador", administradorSchema);