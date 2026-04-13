document.addEventListener("click", (e) => {
  if (e.target.closest("#sino-notificacoes")) {
    document.dispatchEvent(new CustomEvent("abrirPrazos"));
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const BASE = window.BASE;
  const navElement = document.querySelector("nav");

  if (navElement) {
    navElement.innerHTML = `
      <div class="nav cl">
        <div class="nav-content rw">
          <div class="nav-options rw">
            <span id="hamburguer" class="icon-nav hamburguer"></span>
            <div id="nav-left" class="nav-left rw">
              <img src="../../public/imagens/logo.png" alt="logo" class="nav-logo">
              <div class="nav-options rw">
                <a href="area_aluno.html"><span class="icon-nav home"></span></a>
                <a href="enviados.html"><span class="icon-nav file-text"></span></a>
                <a id="open-popup"><span class="icon-nav question"></span></a>
                <a id="alternador"><span class="icon-nav moon"></span></a>
                <div style="position:relative;">
                  <span id="btn-acessibilidade" class="icon-nav acessibilidade" title="Acessibilidade"></span>
                  <div id="menu-acessibilidade" class="menu-acess">
                    <button data-modo="normal">Normal</button>
                    <button data-modo="deuteranopia">Deuteranopia</button>
                    <button data-modo="protanopia">Protanopia</button>
                    <button data-modo="tritanopia">Tritanopia</button>
                    <button data-modo="alto-contraste">Alto Contraste</button>
                  </div>
                </div>
                <a id="sino-notificacoes" style="position:relative; cursor:pointer;">
                  <span class="icon-nav" style="background-image: url('../../public/icons/sino.png')"></span>
                  <span id="sino-badge" style="
                    display:none;
                    position:absolute;
                    top:2px; right:2px;
                    background:var(--vermelho);
                    color:#fff;
                    border-radius:50%;
                    width:16px; height:16px;
                    font-size:10px;
                    align-items:center;
                    justify-content:center;
                  "></span>
                </a>
              </div>
            </div>
          </div>
          <div class="rw g16 fc">
            <a id="perfil" href="perfil.html">
              <div class="nav-perfil rw">
                <div id="perfil-info" class="cl">
                  <p id="nome" class="name"></p>
                  <p id="email" class="email"></p>
                </div>
                <img id="nav-foto" src="../../public/imagens/ft-perfil.png" alt="foto de perfil" class="foto-perfil">
              </div>
            </a>
            <span class="icon student"></span>
          </div>
        </div>
      </div>
    `;
  }

  document.getElementById("nome").textContent =
    localStorage.getItem("nomeUser") || "";
  document.getElementById("email").textContent =
    localStorage.getItem("emailUser") || "";

  const foto = localStorage.getItem("foto");
  const navFoto = document.getElementById("nav-foto");
  if (foto && navFoto) {
    navFoto.src = BASE + "/back-end/" + foto + "?t=" + Date.now();
  }
});
