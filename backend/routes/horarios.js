/**
 * routes/horarios.js — Rota pública de horários disponíveis.
 *
 * GET /api/horarios?data=YYYY-MM-DD&servico=<ObjectId>
 *   Retorna slots do dia que ainda não estão ocupados, ordenados por hora_inicio.
 *   Ambos os parâmetros são obrigatórios.
 *
 * Resposta: Array<{ _id, servico_id, data, hora_inicio, hora_fim, ocupado }>
 */

const router            = require("express").Router();
const HorarioDisponivel = require("../models/03_horarios_disponiveis");

// Consulta de horários livres para uma data+serviço específicos
router.get("/", async (req, res) => {
  try {
    const { data, servico } = req.query;

    if (!data || !servico) {
      return res.status(400).json({ erro: "Informe 'data' e 'servico' na query." });
    }

    // Delimita a busca ao dia inteiro para evitar fuso-horário cruzando datas
    const inicio = new Date(data);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(data);
    fim.setHours(23, 59, 59, 999);

    const horarios = await HorarioDisponivel.find({
      servico_id: servico,
      data: { $gte: inicio, $lte: fim },
      ocupado: false,
    }).sort("hora_inicio");

    res.json(horarios);
  } catch (err) {
    console.error("[horarios] GET /", err);
    res.status(500).json({ erro: "Erro ao buscar horários." });
  }
});

module.exports = router;
