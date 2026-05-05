/**
 * modelo.js — Aluno: carrega modelos dinamicamente do banco (API Laravel)
 */
document.addEventListener("DOMContentLoaded", async () => {
  const descricoesPadrao = {
    A: "Esse termo deve conter dados do aluno, da empresa, do supervisor direto e a data de início das atividades.",
    B: "O aluno descreve as atividades realizadas e as relaciona com o conteúdo do curso.",
    C: "Declaração de Atividades, que formaliza o encerramento das atividades desenvolvidas durante o período.",
  };

  try {
    // const data = await Api.get("/professor/modelos");
    const data = await Api.get("/aluno/modelos");
    if (!data?.success) return;

    const grid = document.getElementById("grid-modelos");
    if (!grid) return;

    // Busca tipos ativos para gerar um card por tipo
    const todostipos = await Api.get("/aluno/tipos");
    const tipos = (todostipos || []).filter((t) => t.ativo !== false);
    if (!tipos?.length) return;

    grid.innerHTML = tipos
      .map((tipo) => {
        const modelo = data.modelos?.[tipo.nome];
        const descricao =
          modelo?.descricao ||
          descricoesPadrao[tipo.nome] ||
          "Siga as instruções do professor.";

        return `
              <div class="container cl p16 g32">
                  <div class="cl g8">
                      <p class="fs16"><b>Modelo do Documento ${
                        tipo.nome
                      }</b></p>
                      <p><b>Instruções :</b></p>
                      <p id="desc-modelo-${tipo.nome}">${descricao}</p>
                  </div>
                  <button id="link-modelo-${tipo.nome}" class="btn-V"
                      ${
                        !modelo?.caminho
                          ? 'disabled style="opacity:0.5;cursor:not-allowed"'
                          : ""
                      }>
                      ${
                        modelo?.caminho
                          ? "Baixar Modelo"
                          : "Modelo não disponível"
                      }
                  </button>
              </div>`;
      })
      .join("");

    // Adiciona eventos nos botões de download
    tipos.forEach((tipo) => {
      const btn = document.getElementById("link-modelo-" + tipo.nome);
      if (btn && !btn.disabled) {
        btn.addEventListener("click", () => {
          // Api.download(
          //   "/professor/modelos/baixar",
          Api.download(
            "/aluno/modelos/baixar",
            { tipo: tipo.nome },
            `Modelo_${tipo.nome}.pdf`
          );
        });
      }
    });
  } catch (e) {
    console.error("Erro ao carregar modelos:", e);
  }
});
