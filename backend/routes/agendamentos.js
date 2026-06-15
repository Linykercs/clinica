/**
 * routes/agendamentos.js — Rotas de agendamento para pacientes e admin.
 *
 * POST /api/agendamentos
 *   Cria um agendamento (público). Faz lock atômico no horário com
 *   findOneAndUpdate para evitar race condition de duplo-booking.
 *   Regra de negócio: exige mínimo 2h de antecedência.
 *
 * POST /api/agendamentos/:id/cancelar  [requer JWT]
 *   Cancela o agendamento, libera o horário e notifica o próximo
 *   da fila de espera (status → "notificado", expira em 2h).
 *
 * POST /api/agendamentos/:id/fila
 *   Insere o paciente na fila de espera de um horário já ocupado.
 *   A posição é calculada incrementalmente a partir do último da fila.
 */

const express           = require("express");
const router            = express.Router();
const Agendamento       = require("../models/04_agendamentos");
const HorarioDisponivel = require("../models/03_horarios_disponiveis");
const FilaEspera        = require("../models/06_fila_espera");
const auth              = require("../middleware/auth");

// ── POST /api/agendamentos — criação pública ──────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { horario_id, paciente_nome, paciente_email, paciente_telefone, observacoes } = req.body;

    if (!horario_id || !paciente_nome || !paciente_email || !paciente_telefone) {
      return res.status(400).json({ erro: "Preencha todos os campos obrigatórios." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paciente_email)) {
      return res.status(400).json({ erro: "Informe um e-mail válido." });
    }

    // Lock atômico: marca como ocupado apenas se ainda estiver livre
    const horario = await HorarioDisponivel.findOneAndUpdate(
      { _id: horario_id, ocupado: false },
      { ocupado: true },
      { new: true }
    );
    if (!horario) return res.status(409).json({ erro: "Horário não disponível ou já ocupado." });

    // Valida antecedência mínima de 2 horas
    const agora    = new Date();
    const dataHora = new Date(horario.data);
    const [h, m]   = horario.hora_inicio.split(":").map(Number);
    dataHora.setHours(h, m, 0, 0);
    if ((dataHora - agora) / 3600000 < 2) {
      // Reverte o lock antes de rejeitar
      await HorarioDisponivel.findByIdAndUpdate(horario_id, { ocupado: false });
      return res.status(400).json({ erro: "Agendamento com mínimo 2h de antecedência." });
    }

    const agendamento = await Agendamento.create({
      horario_id, paciente_nome, paciente_email, paciente_telefone, observacoes, origem: "site",
    });
    res.status(201).json({ mensagem: "Consulta agendada com sucesso!", agendamento });
  } catch (err) {
    console.error("[agendamentos] POST /", err);
    res.status(500).json({ erro: "Erro ao criar agendamento." });
  }
});

// ── POST /api/agendamentos/:id/cancelar — cancelamento (admin) ───────────
router.post("/:id/cancelar", auth, async (req, res) => {
  try {
    const agendamento = await Agendamento.findById(req.params.id);
    if (!agendamento) return res.status(404).json({ erro: "Não encontrado." });

    agendamento.status = "cancelado";
    await agendamento.save();

    // Libera o slot para que outros pacientes possam agendar
    await HorarioDisponivel.findByIdAndUpdate(agendamento.horario_id, { ocupado: false });

    // Notifica o primeiro da fila (se houver), dando 2h para confirmar
    const proximo = await FilaEspera.findOne({
      horario_id: agendamento.horario_id,
      status: "aguardando",
    }).sort("posicao");

    if (proximo) {
      await proximo.updateOne({
        status: "notificado",
        notificado_em: new Date(),
        expira_em: new Date(Date.now() + 7200000), // +2h
      });
    }

    res.json({ mensagem: "Cancelado com sucesso." });
  } catch (err) {
    console.error("[agendamentos] POST /:id/cancelar", err);
    res.status(500).json({ erro: "Erro ao cancelar." });
  }
});

// ── POST /api/agendamentos/:id/fila — fila de espera (público) ───────────
router.post("/:id/fila", async (req, res) => {
  try {
    const { paciente_nome, paciente_email, paciente_telefone } = req.body;
    const horario_id = req.params.id;

    if (!paciente_nome || !paciente_email || !paciente_telefone) {
      return res.status(400).json({ erro: "Preencha todos os campos." });
    }

    // Posição = último da fila + 1 (ou 1 se a fila estiver vazia)
    const ultimo  = await FilaEspera.findOne({ horario_id, status: "aguardando" }).sort("-posicao");
    const posicao = ultimo ? ultimo.posicao + 1 : 1;

    const entrada = await FilaEspera.create({
      horario_id, paciente_nome, paciente_email, paciente_telefone, posicao,
    });
    res.status(201).json({ mensagem: `Você está na posição ${posicao} da fila.`, entrada });
  } catch (err) {
    console.error("[agendamentos] POST /:id/fila", err);
    res.status(500).json({ erro: "Erro ao entrar na fila." });
  }
});

module.exports = router;
