/**
 * enviados.js — Documentos enviados pelo aluno (API Laravel)
 */
let dadosEnviados = { ultimos: [], historico: [] };

document.addEventListener('DOMContentLoaded', async () => {
  await carregarEnviados();
  iniciarFiltros();
});

async function carregarEnviados() {
  const alunoId = localStorage.getItem('idaluno');
  if (!alunoId) return;

  try {
    const data = await Api.post('/aluno/documentos', { aluno_id: alunoId });
    if (data?.erro) { console.error(data.erro); return; }

    dadosEnviados = data;
    renderizar(dadosEnviados.ultimos, dadosEnviados.historico);
  } catch (e) {
    console.error('Erro ao carregar enviados:', e);
  }
}

function renderizar(ultimos, historico) {
  const ultimosContainer   = document.getElementById('ultimos-container');
  const historicoContainer = document.getElementById('historico-container');
  const historicoHeader    = document.getElementById('historico-header');

  ultimosContainer.innerHTML = ultimos.length === 0
    ? `<div class="container cl p16 cc"><p class="fs16"><b>Você ainda não enviou nenhum documento</b></p></div>`
    : ultimos.map(doc => criarCardDoc(doc, true)).join('');

  if (historico.length === 0) {
    historicoHeader.style.display = 'none';
    historicoContainer.innerHTML  = '';
  } else {
    historicoHeader.style.display = '';
    historicoContainer.innerHTML  = historico.map(doc => criarCardDoc(doc, false)).join('');
  }
}

function criarCardDoc(doc, destaque) {
  const dataFmt   = new Date(doc.dataEmissao).toLocaleDateString('pt-BR');
  const iconClass = getIconClass(doc.status);
  const caminho   = doc.caminho_arquivo
    ? `${window.BASE}/storage/${doc.caminho_arquivo}`
    : null;

  return `
    <div class="container cl ${destaque ? 'doc-destaque' : ''}">
      <div class="topV rw jc-sb g16">
        <p class="TopTxt">${doc.descricao || '(sem nome)'}</p>
        <span class="icon-list ${iconClass}"></span>
      </div>
      <div class="cl p16 g16">
        <div class="cl g8">
          <p>Tipo do Documento : ${doc.tipo}</p>
          <p>Status : ${doc.status}</p>
          <p>Data de Envio : ${dataFmt}</p>
        </div>
        ${doc.feedback ? `
          <div class="information-container">
            <div class="jc-sb rw"><p>Feedback :</p><p>${doc.status}</p></div>
            <p>${doc.feedback}</p>
          </div>` : ''}
        ${caminho ? `
          <button class="btn-link fc" onclick="window.open('${caminho}', '_blank')">
            <span class="icon-link"></span> Abrir Documento
          </button>` : ''}
      </div>
    </div>`;
}

function getIconClass(status) {
  return { Validado: 'check', Invalidado: 'off', Visualizado: 'eye', 'Não Avaliado': 'clock' }[status] || 'clock';
}

function iniciarFiltros() {
  document.querySelectorAll(".option-wrapper input[type='checkbox']").forEach(cb => {
    cb.addEventListener('change', aplicarFiltro);
  });
}

function aplicarFiltro() {
  const selecionados = [...document.querySelectorAll(".option-wrapper input[type='checkbox']:checked")]
    .map(cb => cb.value);
  renderizar(
    dadosEnviados.ultimos.filter(d  => selecionados.includes(d.tipo)),
    dadosEnviados.historico.filter(d => selecionados.includes(d.tipo))
  );
}
