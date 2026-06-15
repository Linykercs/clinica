/**
 * models/08_contatos.js — Mensagens do formulário de contato.
 *
 * Visitantes do site podem enviar mensagens sem precisar de conta.
 * O admin visualiza via GET /api/admin/contatos e pode marcar como respondido
 * (campo respondido + respondido_em) para controle de pendências.
 *
 * Campos:
 *   nome          - Nome do remetente
 *   email         - E-mail para resposta (lowercase)
 *   assunto       - Assunto da mensagem
 *   mensagem      - Corpo da mensagem
 *   respondido    - false enquanto não respondido (filtrado no dashboard)
 *   respondido_em - Data da resposta
 *
 * Timestamps: criado_em, atualizado_em
 */

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