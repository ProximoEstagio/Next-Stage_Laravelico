/**
 * secretaria.js — (API Laravel)
 */
let todosAlunos = [];

document.addEventListener('DOMContentLoaded', async () => {
  await carregarConcluidos();
});

async function carregarConcluidos() {
  try {
    const data = await Api.get('/secretaria/alunos-concluidos');
    if (data?.erro) { console.error(data.erro); return; }

    todosAlunos = data.alunos;
    document.getElementById('total-concluidos').textContent = 'Total: ' + data.total;

    renderizarFiltros();
    renderizarLista(todosAlunos);
  } catch (e) {
    console.error('Erro ao carregar:', e);
  }
}

function renderizarFiltros() {
  const cursos    = [...new Set(todosAlunos.map(a => a.nomeCurso).filter(Boolean))];
  const container = document.getElementById('filtros-curso');

  if (!cursos.length) { container.innerHTML = '<p>Sem filtros disponíveis.</p>'; return; }

  container.innerHTML = cursos.map(curso => `
    <label class="option-wrapper">
      <input type="checkbox" value="${curso}" checked />
      <div class="custom-box"><div class="inner-box"></div></div>
      <p>${curso}</p>
    </label>`).join('');

  container.querySelectorAll('input[type="checkbox"]').forEach(cb =>
    cb.addEventListener('change', aplicarFiltro)
  );
}

function aplicarFiltro() {
  const selecionados = [...document.querySelectorAll('#filtros-curso input:checked')].map(cb => cb.value);
  renderizarLista(todosAlunos.filter(a => selecionados.includes(a.nomeCurso)));
}

function renderizarLista(alunos) {
  const tbody = document.getElementById('lista-concluidos');

  if (!alunos.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px">Nenhum aluno concluído encontrado</td></tr>`;
    return;
  }

  tbody.innerHTML = alunos.map(a => `
    <tr class="aluno-row" style="cursor:pointer" onclick="toggleDocumentos(${a.idaluno})">
      <td>${a.nome}</td>
      <td>${a.ra}</td>
      <td>${a.email}</td>
      <td>${a.nomeCurso || '-'}</td>
      <td><div class="rw"><span class="icon-list ${a.documentos?.length > 0 ? 'check' : 'clock'}"></span></div></td>
    </tr>
    <tr id="docs-${a.idaluno}" style="display:none">
      <td colspan="5">
        <div class="cl g8 p16">
          ${a.documentos?.length > 0
            ? a.documentos.map(doc => `
              <div class="rw g16 jc-sb">
                <div class="cl g4">
                  <p><b>Documento ${doc.tipo}</b> — ${doc.descricao || '(sem nome)'}</p>
                  <p style="font-size:12px;opacity:0.6">${new Date(doc.dataEmissao).toLocaleDateString('pt-BR')}</p>
                </div>
                ${doc.caminho_arquivo
                  ? `<button class="btn-link fc" onclick="event.stopPropagation();window.open('${window.BASE}/storage/${doc.caminho_arquivo}','_blank')">
                       <span class="icon-link"></span> Abrir
                     </button>`
                  : '<p>Sem arquivo</p>'}
              </div>`).join('')
            : '<p>Nenhum documento encontrado</p>'}
        </div>
      </td>
    </tr>`).join('');
}

function toggleDocumentos(alunoId) {
  const row = document.getElementById(`docs-${alunoId}`);
  if (!row) return;
  row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
}
