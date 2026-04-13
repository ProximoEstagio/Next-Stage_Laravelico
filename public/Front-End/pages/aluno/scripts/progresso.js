/**
 * progresso.js — Barra de progresso e notificações (API Laravel)
 */
async function carregarProgresso() {
  const alunoId = localStorage.getItem('idaluno');
  if (!alunoId) return;

  try {
    const data = await Api.post('/aluno/documentos', { aluno_id: alunoId });
    if (data?.erro) return;

    const { tiposEnviados, ultimos, prazos = [] } = data;
    window._todosPrazos = prazos;

    // Barra de progresso (dinâmica, baseada nos tipos cadastrados)
    tiposEnviados.forEach(tipo => {
      const circle = document.getElementById('circle-' + tipo);
      const prog   = document.getElementById('prog-'   + tipo);
      if (circle) { circle.classList.remove('circle'); circle.classList.add('circleComplete'); }
      if (prog)   prog.querySelector('.progProgres').style.width = '100%';
    });

    // Sino
    const notificacoes = prazos.filter(p => p.vencido || p.urgente);
    atualizarSino(notificacoes, prazos);

    // Popup automático na entrada
    if (notificacoes.length > 0 && !sessionStorage.getItem('notif_exibida')) {
      exibirPopupNotificacoes(notificacoes);
      sessionStorage.setItem('notif_exibida', '1');
    }

    // Último documento
    const container = document.getElementById('ultimo-doc-content');
    if (!container) return;

    if (ultimos.length === 0) {
      container.innerHTML = `
        <p class="fs16"><b>Você ainda não enviou nenhum Documento</b></p>
        <p>Eles aparecerão aqui assim que você enviar um</p>`;
      return;
    }

    const ultimo    = ultimos[0];
    const dataFmt   = new Date(ultimo.dataEmissao).toLocaleDateString('pt-BR');
    const iconClass = getIconClassAluno(ultimo.status);
    const caminho   = ultimo.caminho_arquivo ? `${window.BASE}/storage/${ultimo.caminho_arquivo}` : null;

    container.innerHTML = `
      <div class="cl g8" style="width:100%">
        <div class="rw jc-sb">
          <p class="fs16"><b>${ultimo.descricao || '(sem nome)'}</b></p>
          <span class="icon-list ${iconClass}"></span>
        </div>
        <p>Tipo : ${ultimo.tipo}</p>
        <p>Status : ${ultimo.status}</p>
        <p>Data : ${dataFmt}</p>
        ${ultimo.feedback ? `
          <div class="information-container">
            <div class="rw jc-sb"><p>Feedback :</p><p>${ultimo.status}</p></div>
            <p>${ultimo.feedback}</p>
          </div>` : ''}
        ${caminho ? `
          <button class="btn-link fc" onclick="window.open('${caminho}', '_blank')">
            <span class="icon-link"></span> Abrir Documento
          </button>` : ''}
      </div>`;

  } catch (e) {
    console.error('Erro ao carregar progresso:', e);
  }
}

function atualizarSino(notificacoes, todosPrazos) {
  const sino  = document.getElementById('sino-notificacoes');
  const badge = document.getElementById('sino-badge');
  if (!sino || !badge) return;

  badge.textContent   = notificacoes.length;
  badge.style.display = notificacoes.length > 0 ? 'flex' : 'none';

  sino.addEventListener('click', () => exibirPopupPrazos(todosPrazos));
}

function exibirPopupNotificacoes(notificacoes) {
  const popup = document.getElementById('popup-layer');
  if (!popup) return;
  const conteudoAtual = popup.innerHTML;

  popup.innerHTML = `
    <div class="popup slim container">
      <div class="topV rw jc-sb">
        <p class="TopTxt">⚠️ Atenção aos Prazos!</p>
        <span id="close-notif" class="icon closeW"></span>
      </div>
      <div class="cl p16 g16">
        ${notificacoes.map(n => `
          <div class="rw g8">
            <span class="icon-list ${n.vencido ? 'off' : 'clock'}"></span>
            <div class="cl g4">
              <p class="fs16"><b>Documento ${n.tipo}</b></p>
              <p style="color:${n.vencido ? 'var(--off)' : 'var(--clock)'}">
                ${n.vencido ? 'Prazo vencido em ' : 'Vence em '}
                ${new Date(n.prazoFinal + 'T00:00:00').toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>`).join('')}
        <button id="close-notif-btn" class="btn-C">Entendido</button>
      </div>
    </div>`;

  popup.classList.add('active');
  document.body.style.overflow = 'hidden';

  const fechar = () => {
    popup.classList.remove('active');
    popup.innerHTML = conteudoAtual;
    document.body.style.overflow = 'auto';
  };
  document.getElementById('close-notif')?.addEventListener('click', fechar);
  document.getElementById('close-notif-btn')?.addEventListener('click', fechar);
}

function exibirPopupPrazos(prazos) {
  const popup = document.getElementById('popup-layer');
  if (!popup) return;
  const conteudoAtual = popup.innerHTML;

  popup.innerHTML = `
    <div class="popup slim container">
      <div class="topV rw jc-sb">
        <p class="TopTxt">Prazos de Entrega</p>
        <span id="close-prazos" class="icon closeW"></span>
      </div>
      <div class="cl p16 g16">
        ${prazos.map(p => {
          const prazoFmt = p.prazoFinal
            ? new Date(p.prazoFinal + 'T00:00:00').toLocaleDateString('pt-BR')
            : 'Não definido';
          const cor = p.vencido ? 'var(--off)' : p.urgente ? 'var(--clock)' : 'var(--cinza)';
          const icon = p.jaEnviou ? 'check' : p.vencido ? 'off' : p.urgente ? 'clock' : 'empty';
          return `
            <div class="rw g8">
              <span class="icon-list ${icon}"></span>
              <div class="cl g4">
                <p class="fs16"><b>Documento ${p.tipo}</b></p>
                <p style="color:${cor}">Prazo: ${prazoFmt}</p>
                ${p.jaEnviou ? '<p style="color:var(--check);font-size:12px">✓ Já enviado</p>' : ''}
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;

  popup.classList.add('active');
  document.body.style.overflow = 'hidden';

  const fechar = () => {
    popup.classList.remove('active');
    popup.innerHTML = conteudoAtual;
    document.body.style.overflow = 'auto';
  };
  document.getElementById('close-prazos')?.addEventListener('click', fechar);
  popup.addEventListener('click', e => { if (e.target === popup) fechar(); });
}

function getIconClassAluno(status) {
  return { Validado: 'check', Invalidado: 'off', Visualizado: 'eye', 'Não Avaliado': 'clock' }[status] || 'clock';
}

document.addEventListener('DOMContentLoaded', () => {
  carregarProgresso();
  document.addEventListener('abrirPrazos', () => {
    if (window._todosPrazos) exibirPopupPrazos(window._todosPrazos);
  });
});
