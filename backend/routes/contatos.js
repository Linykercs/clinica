const express = require("express");
const router  = express.Router();
const Contato = require("../models/08_contatos");

router.post("/", async (req, res) => {
  try {
    const { nome, email, assunto, mensagem } = req.body;
    if (!nome || !email || !assunto || !mensagem) {
      return res.status(400).json({ erro: "Preencha todos os campos." });
    }
    const contato = await Contato.create({ nome, email, assunto, mensagem });
    res.status(201).json({ mensagem: "Mensagem recebida com sucesso!", contato });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao enviar mensagem." });
  }
});

module.exports = router;