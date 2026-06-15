/**
 * models/02_servicos.js — Catálogo de serviços da clínica.
 *
 * Campos:
 *   nome        - Nome exibido no site e no painel
 *   descricao   - Descrição curta do tratamento (opcional)
 *   duracao_min - Duração em minutos (mínimo 15); usada para calcular hora_fim dos slots
 *   ativo       - false oculta o serviço sem excluí-lo
 *
 * Timestamps: criado_em, atualizado_em
 */

const mongoose = require("mongoose");

const servicoSchema = new mongoose.Schema(
  {
    nome:        { type: String, required: true, trim: true },
    descricao:   { type: String, trim: true },
    duracao_min: { type: Number, required: true, min: 15 },
    ativo:       { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "criado_em", updatedAt: "atualizado_em" } }
);

module.exports = mongoose.model("Servico", servicoSchema);