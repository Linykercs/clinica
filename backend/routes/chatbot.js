/**
 * routes/chatbot.js — Chatbot baseado em palavras-chave (FAQ).
 *
 * GET /api/chatbot?pergunta=<texto>
 *   Normaliza a pergunta (lowercase, remove acentos, split por espaço),
 *   filtra palavras com mais de 2 caracteres e busca FAQs ativas que
 *   contenham ao menos uma dessas palavras nos campos palavras_chave.
 *   Retorna a resposta de maior prioridade (menor campo "ordem").
 *
 * Resposta sucesso:  { resposta: string, encontrou: true }
 * Resposta fallback: { resposta: "Não encontrei...", encontrou: false }
 *
 * Obs: sem IA generativa — respostas vêm exclusivamente do banco de FAQs.
 */

const express    = require("express");
const router     = express.Router();
const ChatbotFaq = require("../models/07_chatbot_faqs");

router.get("/", async (req, res) => {
  try {
    const { pergunta } = req.query;
    if (!pergunta) return res.status(400).json({ erro: "Informe a pergunta." });

    // Normalização: minúsculo → remove diacríticos → tokeniza → descarta stopwords curtas
    const palavras = pergunta
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .split(/\s+/)
      .filter((p) => p.length > 2);

    const faqs = await ChatbotFaq.find({
      ativo: true,
      palavras_chave: { $in: palavras },
    }).sort("ordem");

    if (!faqs.length) {
      return res.json({ resposta: "Não encontrei resposta. Entre em contato pelo formulário.", encontrou: false });
    }

    // Retorna apenas a FAQ de maior prioridade (menor ordem)
    res.json({ resposta: faqs[0].resposta, encontrou: true });
  } catch (err) {
    res.status(500).json({ erro: "Erro no chatbot." });
  }
});

module.exports = router;
