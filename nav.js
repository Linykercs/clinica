/**
 * nav.js — Controla o menu de navegação responsivo (hamburguer).
 *
 * Escuta o clique no botão #navToggle para abrir/fechar o #navLinks.
 * Ao clicar em qualquer link do menu, fecha o menu automaticamente
 * (comportamento esperado em mobile).
 */

const toggle = document.getElementById("navToggle");
const links  = document.getElementById("navLinks");

if (toggle && links) {
  toggle.addEventListener("click", () => links.classList.toggle("open"));
}

// Fecha o menu ao navegar para evitar que fique aberto após troca de página via SPA parcial
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => links && links.classList.remove("open"));
});
