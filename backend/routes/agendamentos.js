const express                = require("express");
const router                 = express.Router();
const Agendamento            = require("../models/04_agendamentos");
const HorarioDisponivel      = require("../models/03_horarios_disponiveis");
const HistoricoReagendamento = require("../models/05_historico_reagendamentos");
const FilaEspera             = require("../models/06_fila_espera");

router.post("/", async (req, res) => {
  try {
    const { horario_id, paciente_nome, paciente_email, paciente_telefone, observacoes } = req.body;
    if (!horario_id || !paciente_nome || !paciente_email || !paciente_telefone) {
      return res.status(400).json({ erro: "Preencha todos os campos obrigatórios." });
    }
    const horario = await HorarioDisponivel.findOneAndUpdate(
      { _id: horario_id, ocupado: false },
      { ocupado: true },
      { new: true }
    );
    if (!horario) return res.status(409).json({ erro: "Horário não disponível ou já ocupado." });

    const agora    = new Date();
    const dataHora = new Date(horario.data);
    const [h, m]   = horario.hora_inicio.split(":").map(Number);
    dataHora.setHours(h, m, 0, 0);
    if ((dataHora - agora) / 3600000 < 24) {
      await HorarioDisponivel.findByIdAndUpdate(horario_id, { ocupado: false });
      return res.status(400).json({ erro: "Agendamento com mínimo 24h de antecedência." });
    }

    const agendamento = await Agendamento.create({ horario_id, paciente_nome, paciente_email, paciente_telefone, observacoes, origem: "site" });
    res.status(201).json({ mensagem: "Consulta agendada com sucesso!", agendamento });
  } catch (err) {
    console.error("[agendamentos] POST /", err);
    res.status(500).json({ erro: "Erro ao criar agendamento." });
  }
});

router.post("/:id/cancelar", async (req, res) => {
  try {
    const agendamento = await Agendamento.findById(req.params.id);
    if (!agendamento) return res.status(404).json({ erro: "Não encontrado." });
    agendamento.status = "cancelado";
    await agendamento.save();
    await HorarioDisponivel.findByIdAndUpdate(agendamento.horario_id, { ocupado: false });
    const proximo = await FilaEspera.findOne({ horario_id: agendamento.horario_id, status: "aguardando" }).sort("posicao");
    if (proximo) {
      await proximo.updateOne({ status: "notificado", notificado_em: new Date(), expira_em: new Date(Date.now() + 7200000) });
    }
    res.json({ mensagem: "Cancelado com sucesso." });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao cancelar." });
  }
});

router.post("/:id/fila", async (req, res) => {
  try {
    const { paciente_nome, paciente_email, paciente_telefone } = req.body;
    const horario_id = req.params.id;
    if (!paciente_nome || !paciente_email || !paciente_telefone) {
      return res.status(400).json({ erro: "Preencha todos os campos." });
    }
    const ultimo  = await FilaEspera.findOne({ horario_id, status: "aguardando" }).sort("-posicao");
    const posicao = ultimo ? ultimo.posicao + 1 : 1;
    const entrada = await FilaEspera.create({ horario_id, paciente_nome, paciente_email, paciente_telefone, posicao });
    res.status(201).json({ mensagem: `Você está na posição ${posicao} da fila.`, entrada });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao entrar na fila." });
  }
});

module.exports = router;