// Model de FAQ do chatbot (busca por palavras-chave)
const mongoose = require("mongoose");

const chatbotFaqSchema = new mongoose.Schema(
  {
    pergunta:       { type: String, required: true, trim: true },
    resposta:       { type: String, required: true, trim: true },
    categoria:      { type: String, enum: ["servicos","horarios","agendamento","localizacao","outros"], default: "outros" },
    palavras_chave: { type: [String], default: [] }, // tokens que acionam esta FAQ na busca
    ordem:          { type: Number, default: 0 },    // menor ordem = maior prioridade
    ativo:          { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "criado_em", updatedAt: "atualizado_em" } }
);

module.exports = mongoose.model("ChatbotFaq", chatbotFaqSchema);
