const express           = require("express");
const router            = express.Router();
const bcrypt            = require("bcryptjs");
const jwt               = require("jsonwebtoken");
const auth              = require("../middleware/auth");
const Administrador     = require("../models/01_administradores");
const Agendamento       = require("../models/04_agendamentos");
const HorarioDisponivel = require("../models/03_horarios_disponiveis");
const Contato           = require("../models/08_contatos");

router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    const admin = await Administrador.findOne({ email, ativo: true });
    if (!admin) return res.status(401).json({ erro: "E-mail ou senha incorretos." });

    const senhaCorreta = await bcrypt.compare(senha, admin.senha_hash);
    if (!senhaCorreta) return res.status(401).json({ erro: "E-mail ou senha incorretos." });

    const token = jwt.sign(
      { id: admin._id, nome: admin.nome, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    await admin.updateOne({ ultimo_acesso: new Date() });
    res.json({ token, nome: admin.nome });
  } catch (err) {
    res.status(500).json({ erro: "Erro no login." });
  }
});

router.get("/agendamentos", auth, async (req, res) => {
  try {
    const filtro = {};
    if (req.query.status) filtro.status = req.query.status;

    const agendamentos = await Agendamento.find(filtro)
      .populate({ path: "horario_id", populate: { path: "servico_id", select: "nome duracao_min" } })
      .sort({ criado_em: -1 });

    res.json(agendamentos);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar agendamentos." });
  }
});

router.patch("/agendamentos/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const statusValidos = ["pendente", "confirmado", "concluido", "cancelado"];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ erro: `Status inválido.` });
    }
    const agendamento = await Agendamento.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!agendamento) return res.status(404).json({ erro: "Não encontrado." });
    res.json({ mensagem: "Status atualizado.", agendamento });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao atualizar." });
  }
});

router.get("/dashboard", auth, async (req, res) => {
  try {
    const hoje   = new Date(); hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje); amanha.setDate(hoje.getDate() + 1);

    const [total, pendentes, confirmados, hojeCount, contatos] = await Promise.all([
      Agendamento.countDocuments(),
      Agendamento.countDocuments({ status: "pendente" }),
      Agendamento.countDocuments({ status: "confirmado" }),
      Agendamento.countDocuments({ criado_em: { $gte: hoje, $lt: amanha } }),
      Contato.countDocuments({ respondido: false }),
    ]);

    res.json({ total, pendentes, confirmados, agendadosHoje: hojeCount, contatosNaoRespondidos: contatos });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar dashboard." });
  }
});

router.post("/horarios", auth, async (req, res) => {
  try {
    const { servico_id, data, slots, duracao_min } = req.body;
    if (!servico_id || !data || !slots || !duracao_min) {
      return res.status(400).json({ erro: "Informe todos os campos." });
    }
    const horarios = slots.map((slot) => {
      const [h, m]   = slot.split(":").map(Number);
      const total    = h * 60 + m + duracao_min;
      const horaFim  = `${String(Math.floor(total/60)).padStart(2,"0")}:${String(total%60).padStart(2,"0")}`;
      return { servico_id, data: new Date(data), hora_inicio: slot, hora_fim: horaFim };
    });
    const criados = await HorarioDisponivel.insertMany(horarios);
    res.status(201).json({ mensagem: `${criados.length} horários criados.`, horarios: criados });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao criar horários." });
  }
});

router.get("/contatos", auth, async (req, res) => {
  try {
    const contatos = await Contato.find().sort({ criado_em: -1 });
    res.json(contatos);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar contatos." });
  }
});

module.exports = router;