// Abrir e fechar menu mobile (hamburguer)
const toggle = document.getElementById("navToggle");
const links  = document.getElementById("navLinks");
if (toggle && links) {
  toggle.addEventListener("click", () => links.classList.toggle("open"));
}
// Fechar menu ao clicar em um link
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => links && links.classList.remove("open"));
});
