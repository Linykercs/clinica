/**
 * server.js — Ponto de entrada da API REST da Clínica Flávia Franco.
 *
 * Stack: Express + Mongoose (MongoDB Atlas).
 * Deploy: Railway (variáveis de ambiente via .env ou painel do Railway).
 *
 * Variáveis de ambiente necessárias:
 *   MONGO_URI        - URI de conexão do MongoDB Atlas
 *   JWT_SECRET       - Segredo para assinar tokens JWT dos administradores
 *   PORT             - Porta do servidor (padrão 3000)
 *   ALLOWED_ORIGINS  - Lista separada por vírgula de origens CORS permitidas
 *                      (padrão: localhost:5500 para desenvolvimento com Live Server)
 *
 * Rotas registradas:
 *   GET  /api/servicos            → Lista serviços ativos
 *   GET  /api/horarios            → Lista horários disponíveis por data+serviço
 *   POST /api/agendamentos        → Cria agendamento (público)
 *   POST /api/agendamentos/:id/cancelar → Cancela agendamento (admin)
 *   POST /api/agendamentos/:id/fila     → Entra na fila de espera (público)
 *   GET  /api/chatbot             → Consulta FAQ do chatbot
 *   POST /api/contatos            → Envia mensagem de contato
 *   POST /api/admin/login         → Autentica admin, retorna JWT
 *   GET  /api/admin/agendamentos  → Lista agendamentos (admin)
 *   PATCH /api/admin/agendamentos/:id → Atualiza status (admin)
 *   GET  /api/admin/dashboard     → Contadores do painel (admin)
 *   POST /api/admin/horarios      → Cria horários em lote (admin)
 *   GET  /api/admin/contatos      → Lista mensagens de contato (admin)
 */

const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
require("dotenv").config();

const app = express();

// CORS: em produção usa ALLOWED_ORIGINS do Railway; em dev aceita Live Server
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5500", "http://127.0.0.1:5500"];

app.use(cors({
  origin: (origin, cb) => {
    // Permite requisições sem origin (ex: curl, Postman, mobile nativo)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error("Origem não permitida pelo CORS"));
  },
}));
app.use(express.json());

// Registro de rotas
app.use("/api/servicos",     require("./routes/servicos"));
app.use("/api/horarios",     require("./routes/horarios"));
app.use("/api/agendamentos", require("./routes/agendamentos"));
app.use("/api/chatbot",      require("./routes/chatbot"));
app.use("/api/contatos",     require("./routes/contatos"));
app.use("/api/admin",        require("./routes/admin"));

// Health-check
app.get("/", (req, res) => res.json({ status: "API funcionando!" }));

// Conecta ao MongoDB e só então sobe o servidor para garantir que as
// queries não falhem por corrida entre inicialização e conexão
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB conectado");
    app.listen(process.env.PORT || 3000, () =>
      console.log(`🚀 Servidor rodando na porta ${process.env.PORT || 3000}`)
    );
  })
  .catch((err) => {
    console.error("❌ Erro:", err.message);
    process.exit(1);
  });
