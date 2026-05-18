const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/servicos",     require("./routes/servicos"));
app.use("/api/horarios",     require("./routes/horarios"));
app.use("/api/agendamentos", require("./routes/agendamentos"));
app.use("/api/chatbot",      require("./routes/chatbot"));
app.use("/api/contatos",     require("./routes/contatos"));
app.use("/api/admin",        require("./routes/admin"));

app.get("/", (req, res) => res.json({ status: "API funcionando!" }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB conectado");
    app.listen(process.env.PORT || 3000, () =>
      console.log("🚀 Servidor rodando em http://localhost:3000")
    );
  })
  .catch((err) => {
    console.error("❌ Erro:", err.message);
    process.exit(1);
  });