/**
 * models/07_chatbot_faqs.js — Base de conhecimento do chatbot.
 *
 * O chatbot usa matching por palavras-chave (sem IA generativa).
 * A rota GET /api/chatbot normaliza a pergunta do usuário, extrai tokens
 * com mais de 2 chars e busca FAQs cujo campo palavras_chave contenha
 * ao menos um desses tokens. A FAQ com menor `ordem` é retornada.
 *
 * Campos:
 *   pergunta      - Pergunta canônica (para referência humana)
 *   resposta      - Texto retornado ao usuário
 *   categoria     - servicos | horarios | agendamento | localizacao | outros
 *   palavras_chave- Array de tokens que acionam esta FAQ
 *   ordem         - Prioridade (menor = maior prioridade) quando múltiplas FAQs batem
 *   ativo         - false desativa sem excluir
 *
 * Timestamps: criado_em, atualizado_em
 */

const mongoose = require("mongoose");

const chatbotFaqSchema = new mongoose.Schema(
  {
    pergunta:       { type: String, required: true, trim: true },
    resposta:       { type: String, required: true, trim: true },
    categoria:      { type: String, enum: ["servicos","horarios","agendamento","localizacao","outros"], default: "outros" },
    palavras_chave: { type: [String], default: [] },
    ordem:          { type: Number, default: 0 },
    ativo:          { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "criado_em", updatedAt: "atualizado_em" } }
);

module.exports = mongoose.model("ChatbotFaq", chatbotFaqSchema);