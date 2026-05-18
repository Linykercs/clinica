const express = require("express");
const router  = express.Router();
const Servico = require("../models/02_servicos");

router.get("/", async (req, res) => {
  try {
    const servicos = await Servico.find({ ativo: true }).sort("nome");
    res.json(servicos);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar serviços." });
  }
});

module.exports = router;