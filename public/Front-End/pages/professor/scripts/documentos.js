/**
 * documentos.js — Professor (API Laravel)
 */
let todosDocumentos = [];
let professorId     = null;

document.addEventListener('DOMContentLoaded', async () => {
  professorId = localStorage.getItem('idprofessor');
  await carregarDocumentos();
  iniciarFiltros();
});

async function carregarDocumentos() {
  const data = await Api.post('/professor/documentos', {
    professor_id: professorId,
    nivel:        localStorage.getItem('nivel') || 'professor',
  });

  if (!data || data.erro) { console.error(data?.erro); return; }

  todosDocumentos = data.documentos;
  atualizarDashboard(data.dashboard, data.total);
  renderizarLista(todosDocumentos);
}

function atualizarDashboard(dashboard, total) {
  if (!total) return;
  const ids = {
    Validado:     { quant: 'quant-check', prog: 'prog-check' },
    Invalidado:   { quant: 'quant-off',   prog: 'prog-off'   },
    Visualizado:  { quant: 'quant-eye',   prog: 'prog-eye'   },
    'Não Avaliado': { quant: 'quant-clock', prog: 'prog-clock' },
  };
  Object.entries(dashboard).forEach(([status, count]) => {
    const el = ids[status];
    if (!el) return;
    const q = document.getElementById(el.quant);
    const p = document.getElementById(el.prog);
    if (q) q.textContent    = count;
    if (p) p.style.width    = (count / total * 100) + '%';
  });
}

function renderizarLista(documentos) {
  const tbody = document.querySelector('.tabela-alunos tbody');
  if (!tbody) return;

  if (!documentos.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px">Nenhum documento encontrado</td></tr>`;
    return;
  }

  tbody.innerHTML = documentos.map(doc => `
    <tr class="doc-row"
        data-id="${doc.iddocumento}"
        data-tipo-id="${doc.tipo_idtipo ?? ''}"
        data-status="${doc.status}"
        data-tipo="${doc.tipo}"
        data-nome-aluno="${doc.nome_aluno}"
        data-ra="${doc.ra}"
        data-descricao="${doc.descricao ?? ''}"
        data-caminho="${doc.caminho_arquivo ?? ''}"
        data-data="${doc.dataEmissao}">
      <td>${doc.descricao || '(sem nome)'}</td>
      <td>${doc.tipo}</td>
      <td>${doc.nome_aluno}</td>
      <td>${doc.ra}</td>
      <td><div class="rw"><span class="icon-list ${getIconClass(doc.status)}"></span></div></td>
      <td><div class="rw"><span class="icon-link"></span></div></td>
    </tr>`).join('');

  document.querySelectorAll('.doc-row').forEach(row => {
    row.addEventListener('click', () => abrirPopup(row.dataset));
  });
}

function getIconClass(status) {
  return { Validado: 'check', Invalidado: 'off', Visualizado: 'eye', 'Não Avaliado': 'clock' }[status] || 'clock';
}

function iniciarFiltros() {
  document.querySelectorAll('input[type="checkbox"]').forEach(cb =>
    cb.addEventListener('change', aplicarFiltros)
  );
}

function aplicarFiltros() {
  const statusSel = [];
  if (document.getElementById('VA')?.checked) statusSel.push('Validado');
  if (document.getElementById('IN')?.checked) statusSel.push('Invalidado');
  if (document.getElementById('VI')?.checked) statusSel.push('Visualizado');
  if (document.getElementById('NA')?.checked) statusSel.push('Não Avaliado');

  const tiposSel = [];
  if (document.getElementById('A')?.checked) tiposSel.push('A');
  if (document.getElementById('B')?.checked) tiposSel.push('B');
  if (document.getElementById('C')?.checked) tiposSel.push('C');

  const filtrados = todosDocumentos.filter(doc => {
    const passaStatus = !statusSel.length || statusSel.includes(doc.status);
    const passaTipo   = !tiposSel.length  || tiposSel.includes(doc.tipo);
    return passaStatus && passaTipo;
  });
  renderizarLista(filtrados);
}

function abrirPopup(dataset) {
  const popup = document.getElementById('popup-layer');
  if (!popup) return;

  popup.querySelector('.topV .TopTxt:first-child').textContent = dataset.descricao || '(sem nome)';
  popup.querySelector('#popup-tipo').textContent               = 'Tipo: ' + dataset.tipo;
  popup.querySelector('#popup-status-txt').textContent         = 'Status: ';
  popup.querySelector('#popup-status-icon').className          = 'icon-list ' + getIconClass(dataset.status);
  popup.querySelector('#popup-nome-aluno').textContent         = dataset.nomeAluno;
  popup.querySelector('#popup-ra').textContent                 = dataset.ra;
  popup.querySelector('#popup-recado').textContent             = dataset.descricao || '(sem recado)';
  popup.querySelector('#popup-data').textContent               = new Date(dataset.data).toLocaleDateString('pt-BR');
  popup.querySelector('#feedback').value                       = '';

  popup.querySelector('#btn-validar').dataset.docId   = dataset.id;
  popup.querySelector('#btn-validar').dataset.tipoId  = dataset.tipoId;
  popup.querySelector('#btn-invalidar').dataset.docId  = dataset.id;
  popup.querySelector('#btn-invalidar').dataset.tipoId = dataset.tipoId;

  const btnAbrirDoc = popup.querySelector('#btn-abrir-doc');
  if (btnAbrirDoc) {
    if (dataset.caminho) {
      btnAbrirDoc.style.display = 'flex';
      btnAbrirDoc.onclick = () => window.open(`${window.BASE}/storage/${dataset.caminho}`, '_blank');
    } else {
      btnAbrirDoc.style.display = 'none';
    }
  }

  popup.classList.add('active');
  document.body.style.overflow = 'hidden';

  if (dataset.status === 'Não Avaliado') {
    atualizarStatus(dataset.id, dataset.tipoId, 'Visualizado', '');
  }
}

async function atualizarStatus(docId, tipoId, status, feedback) {
  await Api.post('/professor/status', {
    professor_id: professorId,
    documento_id: docId,
    tipo_id:      tipoId,
    status,
    feedback,
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('popup-layer');

  document.addEventListener('click', async e => {
    if (e.target.id === 'close-popup' || e.target === popup) {
      popup.classList.remove('active');
      document.body.style.overflow = 'auto';
      await carregarDocumentos();
    }
    if (e.target.closest('#btn-validar')) {
      const btn = e.target.closest('#btn-validar');
      await atualizarStatus(btn.dataset.docId, btn.dataset.tipoId, 'Validado', document.getElementById('feedback')?.value || '');
      popup.classList.remove('active');
      document.body.style.overflow = 'auto';
      await carregarDocumentos();
    }
    if (e.target.closest('#btn-invalidar')) {
      const btn = e.target.closest('#btn-invalidar');
      await atualizarStatus(btn.dataset.docId, btn.dataset.tipoId, 'Invalidado', document.getElementById('feedback')?.value || '');
      popup.classList.remove('active');
      document.body.style.overflow = 'auto';
      await carregarDocumentos();
    }
  });
});
