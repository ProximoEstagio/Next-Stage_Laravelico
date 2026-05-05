/**
 * faq.js — Página de FAQ do aluno (API Laravel)
 */
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("faq-container");

  try {
    const data = await Api.get("/faq");

    if (!data || !data.length) {
      container.innerHTML = `
              <div class="container p16 cc cl g8">
                  <p class="fs16"><b>Nenhuma pergunta cadastrada ainda.</b></p>
                  <p>Em breve o professor adicionará as perguntas frequentes.</p>
              </div>`;
      return;
    }

    container.innerHTML = data
      .map(
        (item, i) => `
          <div class="faq-item" id="faq-${i}">
              <div class="faq-pergunta" onclick="toggleFaq(${i})">
                  <p>${item.pergunta}</p>
                  <span class="faq-seta">▼</span>
              </div>
              <div class="faq-resposta">
                  <p>${item.resposta}</p>
              </div>
          </div>`
      )
      .join("");
  } catch (e) {
    console.error("Erro ao carregar FAQ:", e);
    container.innerHTML =
      '<p style="padding:16px">Erro ao carregar perguntas.</p>';
  }
});

function toggleFaq(i) {
  const item = document.getElementById("faq-" + i);
  if (!item) return;
  item.classList.toggle("aberto");
}
