document.addEventListener("DOMContentLoaded", function () {
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
                <a href="secretaria.html"><span class="icon-nav users"></span></a>
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
              </div>
            </div>
          </div>
          <div class="rw g16 fc">
            <div class="nav-perfil rw">
              <div id="perfil-info" class="cl">
                <p id="nome" class="name"></p>
                <p id="email" class="email"></p>
              </div>
            </div>
            <button id="logout" class="btn-V fc" style="height:36px">
              <span class="icon logout"></span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  document.getElementById("nome").textContent =
    localStorage.getItem("nomeUser") || "";
  document.getElementById("email").textContent =
    localStorage.getItem("emailUser") || "";
});
