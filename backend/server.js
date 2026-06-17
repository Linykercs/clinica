const express   = require("express");
const mongoose  = require("mongoose");
const cors      = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

const allowedOrigins = [
  "https://linykercs.github.io",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error("Origem não permitida pelo CORS"));
  },
}));
app.use(express.json());

app.use("/api/chatbot", rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false }));

// Registrar rotas
app.use("/api/servicos",     require("./routes/servicos"));
app.use("/api/horarios",     require("./routes/horarios"));
app.use("/api/agendamentos", require("./routes/agendamentos"));
app.use("/api/chatbot",      require("./routes/chatbot"));
app.use("/api/contatos",     require("./routes/contatos"));
app.use("/api/admin",        require("./routes/admin"));

// Health check
app.get("/", (req, res) => res.json({ status: "API funcionando!" }));

// Conectar ao banco e subir o servidor
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
