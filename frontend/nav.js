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

// Animacoes de scroll (fade-up)
if ("IntersectionObserver" in window) {
  const targets = document.querySelectorAll(
    ".hero-text, .hero-image, .stat, .cta-text, " +
    ".servico-card-item, .beneficio-card, " +
    ".quem-somos-text, .maquina-hero-text, .maquina-hero-img, " +
    ".blob-taupe, .servicos-hero-img"
  );
  targets.forEach(el => el.classList.add("fade-up"));
  document.querySelectorAll(".servico-card-item").forEach((el, i) => {
    el.style.transitionDelay = (i * 0.05) + "s";
  });
  document.querySelectorAll(".beneficio-card").forEach((el, i) => {
    el.style.transitionDelay = (i * 0.06) + "s";
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".fade-up").forEach(el => io.observe(el));
}
