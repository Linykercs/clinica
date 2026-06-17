const express    = require("express");
const router     = express.Router();
const ChatbotFaq = require("../models/07_chatbot_faqs");

// Responder pergunta do chatbot
router.get("/", async (req, res) => {
  try {
    const { pergunta } = req.query;
    if (!pergunta) return res.status(400).json({ erro: "Informe a pergunta." });

    const palavras = pergunta
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .split(/\s+/)
      .filter((p) => p.length > 2);

    const faqs = await ChatbotFaq.find({ ativo: true, palavras_chave: { $in: palavras } });

    if (!faqs.length) {
      return res.json({ resposta: "Não encontrei resposta. Entre em contato pelo formulário.", encontrou: false });
    }

    // Score by number of matching keywords, break ties by ordem
    const melhor = faqs
      .map(f => ({ faq: f, score: palavras.filter(p => f.palavras_chave.includes(p)).length }))
      .sort((a, b) => b.score - a.score || a.faq.ordem - b.faq.ordem)[0];

    res.json({ resposta: melhor.faq.resposta, encontrou: true });
  } catch (err) {
    res.status(500).json({ erro: "Erro no chatbot." });
  }
});

module.exports = router;
