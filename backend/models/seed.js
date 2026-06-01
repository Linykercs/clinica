const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

async function seed() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/clinica_regenerativa";
  await mongoose.connect(uri);
  console.log("✅ MongoDB conectado");

  const Administrador     = require("./01_administradores");
  const Servico           = require("./02_servicos");
  const HorarioDisponivel = require("./03_horarios_disponiveis");
  const ChatbotFaq        = require("./07_chatbot_faqs");

  await Administrador.deleteMany({});
  await Servico.deleteMany({});
  await HorarioDisponivel.deleteMany({});
  await ChatbotFaq.deleteMany({});

  const senhaHash = await bcrypt.hash("admin123", 10);
  await Administrador.create({ nome: "Administrador", email: "admin@clinica.com", senha_hash: senhaHash });
  console.log("✅ Admin criado: admin@clinica.com / admin123");

  const servicos = await Servico.insertMany([
    { nome: "Consulta Inicial",            descricao: "Avaliação geral",            duracao_min: 60 },
    { nome: "Terapia de Rejuvenescimento", descricao: "Tratamento estético",        duracao_min: 90 },
    { nome: "Ozônioterapia",               descricao: "Tratamento com ozônio",      duracao_min: 45 },
    { nome: "Nutrição Funcional",          descricao: "Consulta com nutricionista", duracao_min: 50 },
  ]);
  console.log(`✅ ${servicos.length} serviços criados`);

  const hoje  = new Date(); hoje.setHours(0, 0, 0, 0);
  const slots = ["08:00","09:00","10:00","11:00","14:00","15:00","16:00"];
  const horarios = [];

  for (let d = 1; d <= 5; d++) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() + d);
    for (const s of servicos) {
      for (const slot of slots) {
        const [h, m]  = slot.split(":").map(Number);
        const total   = h * 60 + m + s.duracao_min;
        const horaFim = `${String(Math.floor(total/60)).padStart(2,"0")}:${String(total%60).padStart(2,"0")}`;
        horarios.push({ servico_id: s._id, data, hora_inicio: slot, hora_fim: horaFim });
      }
    }
  }
  await HorarioDisponivel.insertMany(horarios);
  console.log(`✅ ${horarios.length} horários criados`);

  await ChatbotFaq.insertMany([
    { pergunta: "Horários de funcionamento?",   resposta: "Segunda a sexta 08h às 18h, sábados 08h às 12h.", categoria: "horarios",    palavras_chave: ["horario","funcionamento","aberto"], ordem: 1 },
    { pergunta: "Como agendar uma consulta?",   resposta: "Clique em Agendar Consulta e escolha o horário.", categoria: "agendamento", palavras_chave: ["agendar","marcar","consulta"],      ordem: 2 },
    { pergunta: "Quais serviços oferece?",      resposta: "Consulta, rejuvenescimento, ozônioterapia e nutrição.", categoria: "servicos", palavras_chave: ["servico","tratamento"],          ordem: 3 },
    { pergunta: "Posso cancelar ou reagendar?", resposta: "Sim, com 48h de antecedência, máximo 2 vezes.",   categoria: "agendamento", palavras_chave: ["cancelar","reagendar","alterar"],   ordem: 4 },
    { pergunta: "Onde fica a clínica?",         resposta: "Patos de Minas - MG. Veja o mapa no site.",       categoria: "localizacao", palavras_chave: ["endereco","onde","mapa"],           ordem: 5 },
  ]);
  console.log("✅ FAQs criadas");

  console.log("✅ Seed finalizado com sucesso!");
  await mongoose.disconnect();
}

seed().catch((err) => { console.error("Erro:", err); process.exit(1); });