const router            = require("express").Router();
const HorarioDisponivel = require("../models/03_horarios_disponiveis");

router.get("/", async (req, res) => {
  try {
    const { data, servico } = req.query;

    if (!data || !servico) {
      return res.status(400).json({ erro: "Informe 'data' e 'servico' na query." });
    }

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
    res.status(500).json({ erro: "Erro ao buscar horários." });
  }
});

module.exports = router;