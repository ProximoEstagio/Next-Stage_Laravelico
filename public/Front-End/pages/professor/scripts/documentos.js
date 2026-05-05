/**
 * documentos.js — Professor (API Laravel) com correção de documentos
 */
let todosDocumentos = [];
let professorId = null;

document.addEventListener("DOMContentLoaded", async () => {
  professorId = localStorage.getItem("idprofessor");
  await carregarDocumentos();
  iniciarFiltros();
});

// ── Carregar documentos ───────────────────────────────────────────────────────

async function carregarDocumentos() {
  const data = await Api.post("/professor/documentos", {
    professor_id: professorId,
    nivel: localStorage.getItem("nivel") || "professor",
  });

  if (!data || data.erro) {
    console.error(data?.erro);
    return;
  }

  todosDocumentos = data.documentos;
  atualizarDashboard(data.dashboard, data.total);
  renderizarLista(todosDocumentos);
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function atualizarDashboard(dashboard, total) {
  if (!total) return;
  const ids = {
    Validado: { quant: "quant-check", prog: "prog-check" },
    Invalidado: { quant: "quant-off", prog: "prog-off" },
    Visualizado: { quant: "quant-eye", prog: "prog-eye" },
    "Não Avaliado": { quant: "quant-clock", prog: "prog-clock" },
  };
  Object.entries(dashboard).forEach(([status, count]) => {
    const el = ids[status];
    if (!el) return;
    const q = document.getElementById(el.quant);
    const p = document.getElementById(el.prog);
    if (q) q.textContent = count;
    if (p) p.style.width = (count / total) * 100 + "%";
  });
}

// ── Renderizar lista ──────────────────────────────────────────────────────────

function renderizarLista(documentos) {
  const tbody = document.querySelector(".tabela-alunos tbody");
  if (!tbody) return;

  if (!documentos.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px">Nenhum documento encontrado</td></tr>`;
    return;
  }

  tbody.innerHTML = documentos
    .map(
      (doc) => `
        <tr class="doc-row"
            data-id="${doc.iddocumento}"
            data-tipo-id="${doc.tipo_idtipo ?? ""}"
            data-status="${doc.status}"
            data-tipo="${doc.tipo}"
            data-nome-aluno="${doc.nome_aluno}"
            data-ra="${doc.ra}"
            data-descricao="${doc.descricao ?? ""}"
            data-caminho="${doc.caminho_arquivo ?? ""}"
            data-data="${doc.dataEmissao}"
            data-corrigido="${doc.corrigido_por_professor ?? 0}">
            <td>
                ${doc.descricao || "(sem nome)"}
                ${
                  doc.corrigido_por_professor
                    ? `
                    <span style="
                        background:var(--eye-50);
                        border:1px solid var(--eye);
                        color:var(--eye);
                        font-size:11px;
                        padding:1px 6px;
                        border-radius:4px;
                        margin-left:6px;
                        font-weight:600;
                        white-space:nowrap;">
                        ✏️ Prof
                    </span>`
                    : ""
                }
            </td>
            <td>${doc.tipo}</td>
            <td>${doc.nome_aluno}</td>
            <td>${doc.ra}</td>
            <td><div class="rw"><span class="icon-list ${getIconClass(
              doc.status
            )}"></span></div></td>
            <td><div class="rw"><span class="icon-link"></span></div></td>
        </tr>`
    )
    .join("");

  document.querySelectorAll(".doc-row").forEach((row) => {
    row.addEventListener("click", () => abrirPopup(row.dataset));
  });
}

function getIconClass(status) {
  return (
    {
      Validado: "check",
      Invalidado: "off",
      Visualizado: "eye",
      "Não Avaliado": "clock",
    }[status] || "clock"
  );
}

// ── Filtros ───────────────────────────────────────────────────────────────────

function iniciarFiltros() {
  document
    .querySelectorAll('input[type="checkbox"]')
    .forEach((cb) => cb.addEventListener("change", aplicarFiltros));
}

function aplicarFiltros() {
  const statusSel = [];
  if (document.getElementById("VA")?.checked) statusSel.push("Validado");
  if (document.getElementById("IN")?.checked) statusSel.push("Invalidado");
  if (document.getElementById("VI")?.checked) statusSel.push("Visualizado");
  if (document.getElementById("NA")?.checked) statusSel.push("Não Avaliado");

  const tiposSel = [];
  if (document.getElementById("A")?.checked) tiposSel.push("A");
  if (document.getElementById("B")?.checked) tiposSel.push("B");
  if (document.getElementById("C")?.checked) tiposSel.push("C");

  renderizarLista(
    todosDocumentos.filter((doc) => {
      const passaStatus = !statusSel.length || statusSel.includes(doc.status);
      const passaTipo = !tiposSel.length || tiposSel.includes(doc.tipo);
      return passaStatus && passaTipo;
    })
  );
}

// ── Popup ─────────────────────────────────────────────────────────────────────

function abrirPopup(dataset) {
  const popup = document.getElementById("popup-layer");
  if (!popup) return;

  const docId = dataset.id;
  const tipoId = dataset.tipoId;
  const status = dataset.status;
  const corrigido = dataset.corrigido === "1" || dataset.corrigido === "true";

  popup.querySelector(".topV .TopTxt:first-child").textContent =
    dataset.descricao || "(sem nome)";
  popup.querySelector("#popup-tipo").textContent = "Tipo: " + dataset.tipo;
  popup.querySelector("#popup-status-txt").textContent = "Status: ";
  popup.querySelector("#popup-status-icon").className =
    "icon-list " + getIconClass(status);
  popup.querySelector("#popup-nome-aluno").textContent = dataset.nomeAluno;
  popup.querySelector("#popup-ra").textContent = dataset.ra;
  popup.querySelector("#popup-recado").textContent =
    dataset.descricao || "(sem recado)";
  popup.querySelector("#popup-data").textContent = new Date(
    dataset.data
  ).toLocaleDateString("pt-BR");
  popup.querySelector("#feedback").value = "";

  // Badge de corrigido pelo professor
  const badge = popup.querySelector("#popup-corrigido-badge");
  if (badge) badge.style.display = corrigido ? "block" : "none";

  // Botão abrir documento
  const btnAbrirDoc = popup.querySelector("#btn-abrir-doc");
  if (btnAbrirDoc) {
    if (dataset.caminho) {
      btnAbrirDoc.style.display = "flex";
      btnAbrirDoc.onclick = () =>
        window.open(`${window.BASE}/storage/${dataset.caminho}`, "_blank");
    } else {
      btnAbrirDoc.style.display = "none";
    }
  }

  // Botões de validar/invalidar
  popup.querySelector("#btn-validar").dataset.docId = docId;
  popup.querySelector("#btn-validar").dataset.tipoId = tipoId;
  popup.querySelector("#btn-invalidar").dataset.docId = docId;
  popup.querySelector("#btn-invalidar").dataset.tipoId = tipoId;

  // Correção — input de arquivo
  const inputCorrecao = popup.querySelector("#input-correcao");
  const nomeArqCorrecao = popup.querySelector("#nome-arquivo-correcao");
  const btnEnviarCor = popup.querySelector("#btn-enviar-correcao");
  const btnSelecionarCor = popup.querySelector("#btn-selecionar-correcao");

  if (inputCorrecao) inputCorrecao.value = "";
  if (nomeArqCorrecao) nomeArqCorrecao.textContent = "";
  if (btnEnviarCor) btnEnviarCor.style.display = "none";

  btnSelecionarCor?.addEventListener("click", () => inputCorrecao?.click());

  inputCorrecao?.addEventListener("change", (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    nomeArqCorrecao.textContent = arquivo.name + " selecionado";
    btnEnviarCor.style.display = "flex";
  });

  btnEnviarCor?.addEventListener("click", async () => {
    const arquivo = inputCorrecao?.files[0];
    if (!arquivo) return;

    const formData = new FormData();
    formData.append("arquivo", arquivo);
    formData.append("documento_id", docId);
    formData.append("tipo_id", tipoId);
    formData.append("professor_id", professorId);

    btnEnviarCor.disabled = true;
    btnEnviarCor.textContent = "Enviando...";

    const data = await Api.upload("/professor/documentos/corrigir", formData);

    if (data?.ok) {
      // Valida automaticamente o documento corrigido
      await atualizarStatus(
        docId,
        tipoId,
        "Validado",
        "Documento corrigido e validado pelo professor."
      );
      alert("Documento corrigido e validado com sucesso!");
      popup.classList.remove("active");
      document.body.style.overflow = "auto";
      await carregarDocumentos();
    } else {
      alert(data?.erro || "Erro ao enviar correção.");
      btnEnviarCor.disabled = false;
      btnEnviarCor.textContent = "Enviar Correção";
    }
  });

  popup.classList.add("active");
  document.body.style.overflow = "hidden";

  // Marca como Visualizado automaticamente
  if (status === "Não Avaliado") {
    atualizarStatus(docId, tipoId, "Visualizado", "");
  }
}

async function atualizarStatus(docId, tipoId, status, feedback) {
  await Api.post("/professor/status", {
    professor_id: professorId,
    documento_id: docId,
    tipo_id: tipoId,
    status,
    feedback,
  });
}

// ── Eventos do popup ──────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("popup-layer");

  document.addEventListener("click", async (e) => {
    // Fechar
    if (e.target.id === "close-popup" || e.target === popup) {
      popup.classList.remove("active");
      document.body.style.overflow = "auto";
      await carregarDocumentos();
    }

    // Validar
    if (e.target.closest("#btn-validar")) {
      const btn = e.target.closest("#btn-validar");
      const feedback = document.getElementById("feedback")?.value || "";
      await atualizarStatus(
        btn.dataset.docId,
        btn.dataset.tipoId,
        "Validado",
        feedback
      );
      popup.classList.remove("active");
      document.body.style.overflow = "auto";
      await carregarDocumentos();
    }

    // Invalidar
    if (e.target.closest("#btn-invalidar")) {
      const btn = e.target.closest("#btn-invalidar");
      const feedback = document.getElementById("feedback")?.value || "";
      await atualizarStatus(
        btn.dataset.docId,
        btn.dataset.tipoId,
        "Invalidado",
        feedback
      );
      popup.classList.remove("active");
      document.body.style.overflow = "auto";
      await carregarDocumentos();
    }
  });
});
