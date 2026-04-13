document.addEventListener("DOMContentLoaded", () => {
  const temaAtual = localStorage.getItem("tema") || "light";
  const modoAtual = localStorage.getItem("modoAcessibilidade") || "normal";

  aplicarTema(temaAtual);
  aplicarModoAcessibilidade(modoAtual);

  // Alternador dark mode
  document.addEventListener("click", (e) => {
    if (e.target.closest("#alternador")) {
      const temaAtual = localStorage.getItem("tema") || "light";
      const novoTema = temaAtual === "dark" ? "light" : "dark";
      localStorage.setItem("tema", novoTema);
      aplicarTema(novoTema);
    }
  });

  // Abre/fecha menu acessibilidade
  document.addEventListener("click", (e) => {
    const btnAcess = document.querySelector("#btn-acessibilidade");
    const menuAcess = document.querySelector("#menu-acessibilidade");
    if (!btnAcess || !menuAcess) return;

    if (e.target.closest("#btn-acessibilidade")) {
      e.stopPropagation();
      menuAcess.classList.toggle("visible");
      atualizarAtivos(menuAcess, modoAtual);
      return;
    }

    if (!e.target.closest("#menu-acessibilidade")) {
      menuAcess.classList.remove("visible");
    }
  });

  // Clique nas opções do menu
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-modo]");
    if (!btn) return;

    const modo = btn.getAttribute("data-modo");
    localStorage.setItem("modoAcessibilidade", modo);
    aplicarModoAcessibilidade(modo);

    const menuAcess = document.querySelector("#menu-acessibilidade");
    if (menuAcess) {
      menuAcess.classList.remove("visible");
      atualizarAtivos(menuAcess, modo);
    }
  });
});

function aplicarTema(tema) {
  document.documentElement.setAttribute("tema", tema);
}

function aplicarModoAcessibilidade(modo) {
  document.documentElement.setAttribute("acessibilidade", modo);
}

function atualizarAtivos(menu, modoAtual) {
  menu.querySelectorAll("[data-modo]").forEach((b) => {
    b.classList.toggle("ativo", b.getAttribute("data-modo") === modoAtual);
  });
}
