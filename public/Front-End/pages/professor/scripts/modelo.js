/**
 * modelo.js — Professor: modelos dinâmicos (API Laravel)
 */

const descricoesPadrao = {
  A: "Esse termo deve conter dados do aluno, da empresa, do supervisor direto e a data de início das atividades.",
  B: "O aluno descreve as atividades realizadas e as relaciona com o conteúdo do curso.",
  C: "Declaração de Atividades, que formaliza o encerramento das atividades desenvolvidas durante o período.",
};

async function carregarModelos() {
  const grid = document.getElementById("grid-modelos");
  if (!grid) return;

  try {
    const [dataModelos, tipos] = await Promise.all([
      Api.get("/professor/modelos"),
      Api.get("/professor/tipos"),
    ]);

    const tiposAtivos = (tipos || []).filter((t) => t.ativo);

    if (!tiposAtivos.length) {
      grid.innerHTML =
        '<p style="padding:16px">Nenhum tipo de documento ativo.</p>';
      return;
    }

    grid.innerHTML = tiposAtivos
      .map((tipo) => {
        const modelo = dataModelos?.modelos?.[tipo.nome];
        const temModelo = modelo?.caminho && modelo?.nome;
        const descricao =
          modelo?.descricao ||
          descricoesPadrao[tipo.nome] ||
          "Sem instruções definidas.";

        return `
              <div class="container cl p16 g32">
                  <div class="cl g8">
                      <p class="fs16"><b>Modelo do Documento ${
                        tipo.nome
                      }</b></p>
                      ${
                        temModelo
                          ? `
                      <div class="rw g8">
                          <a href="${window.BASE}/storage/${modelo.caminho}"
                             target="_blank"
                             style="color:var(--cinza);text-decoration:underline;">
                              Visualizar modelo atual
                          </a>
                      </div>`
                          : ""
                      }
                      <p><b>Instruções :</b></p>
                      <p>${descricao}</p>
                  </div>
                  <button data-open-popup="modelo" class="btn-V" data-tipo="${
                    tipo.nome
                  }">
                      ${temModelo ? "Substituir Modelo" : "Novo Modelo"}
                  </button>
              </div>`;
      })
      .join("");

    if (typeof iniciarPopupModelo === "function") iniciarPopupModelo();
  } catch (e) {
    console.error("Erro ao carregar modelos:", e);
    grid.innerHTML = '<p style="padding:16px">Erro ao carregar modelos.</p>';
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await carregarModelos();
});
