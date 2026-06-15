/**
 * middleware/auth.js — Middleware de autenticação JWT para rotas de admin.
 *
 * Uso: aplique como segundo argumento em qualquer rota protegida:
 *   router.get("/rota", auth, async (req, res) => { ... })
 *
 * Após passar pela validação, disponibiliza req.admin com o payload
 * decodificado do token: { id, nome, email, iat, exp }.
 *
 * O token deve ser enviado no header:
 *   Authorization: Bearer <token>
 */

const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ erro: "Acesso negado. Token não informado." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // payload disponível nos handlers seguintes
    next();
  } catch {
    // Cobre tanto token expirado (TokenExpiredError) quanto assinatura inválida
    res.status(401).json({ erro: "Token inválido ou expirado." });
  }
};
