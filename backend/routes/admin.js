const express           = require("express");
const router            = express.Router();
const bcrypt            = require("bcryptjs");
const jwt               = require("jsonwebtoken");
const auth              = require("../middleware/auth");
const Administrador     = require("../models/01_administradores");
const Agendamento       = require("../models/04_agendamentos");
const HorarioDisponivel = require("../models/03_horarios_disponiveis");
const Contato           = require("../models/08_contatos");
const ChatbotFaq        = require("../models/07_chatbot_faqs");

// Fazer login admin
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

// Listar agendamentos (com filtro por status)
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

// Atualizar status do agendamento
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

// Deletar agendamento e liberar o horario
router.delete("/agendamentos/:id", auth, async (req, res) => {
  try {
    const agendamento = await Agendamento.findByIdAndDelete(req.params.id);
    if (!agendamento) return res.status(404).json({ erro: "Não encontrado." });
    await HorarioDisponivel.findByIdAndUpdate(agendamento.horario_id, { ocupado: false });
    res.json({ mensagem: "Agendamento removido." });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao remover agendamento." });
  }
});

// Buscar dados do dashboard (totais e contadores)
router.get("/dashboard", auth, async (req, res) => {
  try {
    const hoje   = new Date(); hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje); amanha.setDate(hoje.getDate() + 1);

    // Buscar horarios cuja data de consulta e hoje
    const horariosHoje = await HorarioDisponivel.find({ data: { $gte: hoje, $lt: amanha } }).select("_id");
    const idsHoje = horariosHoje.map(h => h._id);

    const [total, pendentes, confirmados, hojeCount, contatos] = await Promise.all([
      Agendamento.countDocuments(),
      Agendamento.countDocuments({ status: "pendente" }),
      Agendamento.countDocuments({ status: "confirmado" }),
      Agendamento.countDocuments({ horario_id: { $in: idsHoje } }),
      Contato.countDocuments({ respondido: false }),
    ]);

    res.json({ total, pendentes, confirmados, agendadosHoje: hojeCount, contatosNaoRespondidos: contatos });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar dashboard." });
  }
});

// Seed de agendamentos fictícios (para demo/apresentação)
router.post("/agendamentos/seed", auth, async (req, res) => {
  try {
    const { agendamentos } = req.body;
    if (!Array.isArray(agendamentos) || !agendamentos.length) {
      return res.status(400).json({ erro: "Envie um array 'agendamentos'." });
    }
    let criados = 0;
    for (const a of agendamentos) {
      const [h, m] = a.hora_inicio.split(":").map(Number);
      const total = h * 60 + m + (a.duracao_min || 60);
      const hora_fim = `${String(Math.floor(total/60)).padStart(2,"0")}:${String(total%60).padStart(2,"0")}`;
      const horario = await HorarioDisponivel.create({
        servico_id: a.servico_id, data: new Date(a.data),
        hora_inicio: a.hora_inicio, hora_fim, ocupado: true,
      });
      const doc = new Agendamento({
        horario_id: horario._id, paciente_nome: a.paciente_nome,
        paciente_email: a.paciente_email, paciente_telefone: a.paciente_telefone,
        status: a.status || "pendente", origem: "admin",
      });
      if (a.criado_em) doc.criado_em = new Date(a.criado_em);
      await doc.save();
      criados++;
    }
    res.status(201).json({ mensagem: `${criados} agendamentos criados.` });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao criar agendamentos seed." });
  }
});

// Cadastrar horarios disponiveis
router.post("/horarios", auth, async (req, res) => {
  try {
    const { servico_id, data, slots, duracao_min } = req.body;
    if (!servico_id || !data || !slots || !duracao_min) {
      return res.status(400).json({ erro: "Informe todos os campos." });
    }
    if (new Date(data) < new Date().setHours(0,0,0,0)) {
      return res.status(400).json({ erro: "Não é possível criar horários em datas passadas." });
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

// Listar mensagens de contato
router.get("/contatos", auth, async (req, res) => {
  try {
    const contatos = await Contato.find().sort({ criado_em: -1 });
    res.json(contatos);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar contatos." });
  }
});

// Listar FAQs do chatbot
router.get("/faqs", auth, async (req, res) => {
  try {
    const faqs = await ChatbotFaq.find().sort("ordem");
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar FAQs." });
  }
});

// Inserir multiplas FAQs (pula duplicatas pela pergunta)
router.post("/faqs/seed", auth, async (req, res) => {
  try {
    const { faqs } = req.body;
    if (!Array.isArray(faqs) || !faqs.length) {
      return res.status(400).json({ erro: "Envie um array 'faqs'." });
    }
    let adicionadas = 0;
    for (const faq of faqs) {
      const existe = await ChatbotFaq.findOne({ pergunta: faq.pergunta });
      if (!existe) { await ChatbotFaq.create(faq); adicionadas++; }
    }
    res.json({ mensagem: `${adicionadas} FAQs adicionadas.`, total: faqs.length });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao inserir FAQs." });
  }
});

// Atualizar uma FAQ
router.patch("/faqs/:id", auth, async (req, res) => {
  try {
    const { pergunta, resposta, palavras_chave, categoria, ordem } = req.body;
    const faq = await ChatbotFaq.findByIdAndUpdate(
      req.params.id,
      { ...(pergunta && { pergunta }), ...(resposta && { resposta }), ...(palavras_chave && { palavras_chave }), ...(categoria && { categoria }), ...(ordem !== undefined && { ordem }) },
      { new: true }
    );
    if (!faq) return res.status(404).json({ erro: "FAQ não encontrada." });
    res.json({ mensagem: "FAQ atualizada.", faq });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao atualizar FAQ." });
  }
});

// Deletar uma FAQ
router.delete("/faqs/:id", auth, async (req, res) => {
  try {
    await ChatbotFaq.findByIdAndDelete(req.params.id);
    res.json({ mensagem: "FAQ removida." });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao deletar FAQ." });
  }
});

module.exports = router;
