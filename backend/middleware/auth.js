const jwt = require("jsonwebtoken");

// Verificar token JWT do admin
module.exports = function auth(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ erro: "Acesso negado. Token não informado." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ erro: "Token inválido ou expirado." });
  }
};
