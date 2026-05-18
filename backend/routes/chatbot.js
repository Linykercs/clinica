const express    = require("express");
const router     = express.Router();
const ChatbotFaq = require("../models/07_chatbot_faqs");

router.get("/", async (req, res) => {
  try {
    const { pergunta } = req.query;
    if (!pergunta) return res.status(400).json({ erro: "Informe a pergunta." });

    const palavras = pergunta
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .split(/\s+/)
      .filter((p) => p.length > 2);

    const faqs = await ChatbotFaq.find({ ativo: true, palavras_chave: { $in: palavras } }).sort("ordem");

    if (!faqs.length) {
      return res.json({ resposta: "Não encontrei resposta. Entre em contato pelo formulário.", encontrou: false });
    }

    res.json({ resposta: faqs[0].resposta, encontrou: true });
  } catch (err) {
    res.status(500).json({ erro: "Erro no chatbot." });
  }
});

module.exports = router;