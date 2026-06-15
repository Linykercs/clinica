/**
 * routes/servicos.js — Rota pública de serviços.
 *
 * GET /api/servicos
 *   Retorna todos os serviços com ativo=true, ordenados por nome.
 *   Usado pelo frontend para preencher o seletor na tela de agendamento.
 *
 * Resposta: Array<{ _id, nome, descricao, duracao_min, ativo, criado_em, atualizado_em }>
 */

const express = require("express");
const router  = express.Router();
const Servico = require("../models/02_servicos");

// Lista serviços ativos — sem autenticação (exibido publicamente no site)
router.get("/", async (req, res) => {
  try {
    const servicos = await Servico.find({ ativo: true }).sort("nome");
    res.json(servicos);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar serviços." });
  }
});

module.exports = router;
