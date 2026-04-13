/**
 * perfil.js — Aluno (API Laravel)
 */
document.addEventListener("DOMContentLoaded", function () {
  const chaves = ["nomeUser", "emailUser", "curso", "telefone"];
  const divInfoPerfil = document.querySelector(".info-perfil");
  const fotoPerfil = document.getElementById("foto-perfil");
  const inputFoto = document.getElementById("input-foto");

  // ── Foto ────────────────────────────────────────────────────────────────────
  const fotoSalva = localStorage.getItem("foto");
  if (fotoPerfil) {
    fotoPerfil.src = fotoSalva
      ? `${window.BASE}/storage/${fotoSalva}`
      : "../../public/imagens/ft-perfil.png";
    fotoPerfil.style.cursor = "pointer";
    fotoPerfil.addEventListener("click", () => inputFoto?.click());
  }

  if (inputFoto) {
    inputFoto.addEventListener("change", async (e) => {
      const arquivo = e.target.files[0];
      if (!arquivo) return;

      const ext = arquivo.name.split(".").pop().toLowerCase();
      if (!["jpg", "jpeg", "png"].includes(ext)) {
        alert("Apenas arquivos JPG e PNG são permitidos.");
        return;
      }

      const formData = new FormData();
      formData.append("foto", arquivo);
      formData.append("emailUser", localStorage.getItem("emailUser"));
      formData.append("tipoUser", localStorage.getItem("tipoUsuario"));

      const data = await Api.upload("/upload-foto", formData);
      if (data?.status === "sucesso") {
        localStorage.setItem("foto", data.foto);
        fotoPerfil.src = `${window.BASE}/storage/${data.foto}?t=${Date.now()}`;
      } else {
        alert(data?.mensagem || "Erro ao atualizar foto.");
      }
    });
  }

  // ── Templates ────────────────────────────────────────────────────────────────
  const infoEstatico = `
    <p>Informações pessoais</p>
    <div class="cl"><p class="desc">Nome :</p><p id="nomeUser" class="fs18"></p></div>
    <div class="cl"><p class="desc">Email :</p><p id="emailUser" class="fs18"></p></div>
    <div class="cl"><p class="desc">Telefone :</p><p id="telefone" class="fs18"></p></div>
    <button id="editPerfil" class="btn-C fc as-fe">
      <span class="icon pencil"></span><p>Editar perfil</p>
    </button>`;

  const infoEditavel = `
    <p>Informações pessoais</p>
    <div class="cl"><p class="desc">Nome :</p><input id="nomeUser" type="text"></div>
    <div class="cl"><p class="desc">Email :</p><input id="emailUser" type="email"></div>
    <div class="cl"><p class="desc">Telefone :</p><input id="telefone" type="text" placeholder="Apenas números"></div>
    <div class="cl"><p class="desc">Nova Senha :</p><input id="novaSenha" type="password" placeholder="Deixe em branco para não alterar"></div>
    <div class="cl"><p class="desc">Confirmar Senha :</p><input id="confirmarSenha" type="password"></div>
    <button id="save" class="btn-C fc as-fe">
      <span class="icon pencil"></span><p>Salvar Alterações</p>
    </button>`;

  // ── Modo estático ─────────────────────────────────────────────────────────
  async function modoEstatico() {
    divInfoPerfil.innerHTML = infoEstatico;
    await carregarPerfil();

    chaves.forEach((chave) => {
      const el = document.getElementById(chave);
      if (el) el.innerHTML = localStorage.getItem(chave) || "";
    });

    document.getElementById("editPerfil")?.addEventListener("click", () => {
      divInfoPerfil.innerHTML = infoEditavel;
      modoEditavel();
    });
  }

  // ── Modo editável ─────────────────────────────────────────────────────────
  function modoEditavel() {
    chaves.forEach((chave) => {
      const el = document.getElementById(chave);
      if (el) el.value = localStorage.getItem(chave) || "";
    });

    document.getElementById("save")?.addEventListener("click", async () => {
      const novaSenha = document.getElementById("novaSenha")?.value;
      const confirmarSenha = document.getElementById("confirmarSenha")?.value;

      if (novaSenha && novaSenha !== confirmarSenha) {
        alert("As senhas não coincidem!");
        return;
      }

      const dados = {
        reason: "update",
        emailUser: localStorage.getItem("emailUser"),
        tipoUser: localStorage.getItem("tipoUsuario"),
        nome: document.getElementById("nomeUser")?.value,
        email: document.getElementById("emailUser")?.value,
        telefone: document.getElementById("telefone")?.value,
      };
      if (novaSenha) dados.senha = novaSenha;

      const res = await Api.post("/perfil", dados);
      if (res?.status === "success") {
        localStorage.setItem("nomeUser", dados.nome);
        localStorage.setItem("emailUser", dados.email);
        localStorage.setItem("telefone", dados.telefone);
        await modoEstatico();
      } else {
        alert(res?.message || "Erro ao salvar.");
      }
    });
  }

  // ── Carregar perfil do banco ───────────────────────────────────────────────
  async function carregarPerfil() {
    const api = await Api.post("/perfil", {
      reason: "loadPage",
      emailUser: localStorage.getItem("emailUser"),
      tipoUser: localStorage.getItem("tipoUsuario"),
    });

    if (!api) return;
    localStorage.setItem("nomeUser", api.nome || "");
    localStorage.setItem("emailUser", api.email || "");
    localStorage.setItem("telefone", api.telefone || "");
    localStorage.setItem("curso", api.nomeCurso || "");
    if (api.foto) {
      localStorage.setItem("foto", api.foto);
      if (fotoPerfil)
        fotoPerfil.src = `${window.BASE}/storage/${api.foto}?t=${Date.now()}`;
    }

    const cursoEl = document.getElementById("curso");
    if (cursoEl) cursoEl.textContent = api.nomeCurso || "";
  }

  modoEstatico();
});
