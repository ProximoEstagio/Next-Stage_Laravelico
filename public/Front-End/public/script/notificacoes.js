/**
 * notificacoes.js — Sino de notificações (aluno e professor)
 *
 * Inclua DEPOIS de config.js, api.js e do nav.js da área:
 *   <script src="../../public/script/notificacoes.js" defer></script>
 *
 * - Busca GET /api/notificacoes (o servidor decide o destinatário pelo token)
 * - Mostra o contador no #sino-badge e a lista num painel ao clicar em #sino-notificacoes
 * - Atualiza sozinho a cada 30s (e ao voltar para a aba) e avisa com um toast quando chega algo novo
 * - No aluno, o contador soma os alertas de prazo (window._prazosAlerta) definidos por progresso.js/sino.js
 */
(function () {
  const INTERVALO_MS = 30000;

  const tipoUsuario = localStorage.getItem('tipoUsuario');
  if (tipoUsuario !== 'aluno' && tipoUsuario !== 'professor') return;

  // Ícone + página de destino por tipo de notificação
  const TIPOS = {
    documento_enviado:    { icone: 'file-text', destino: 'documentos.html' },
    documento_validado:   { icone: 'check',     destino: 'enviados.html' },
    documento_invalidado: { icone: 'off',       destino: 'enviados.html' },
    documento_corrigido:  { icone: 'pencil',    destino: 'enviados.html' },
    prazo_atualizado:     { icone: 'clock',     destino: 'area_aluno.html' },
  };

  const estado = {
    itens: [],
    naoLidas: 0,
    ultimoIdVisto: null, // null = ainda não carregou (não faz toast na primeira carga)
    painel: null,
    timer: null,
  };

  // ── Utilidades ────────────────────────────────────────────────────────────

  function esc(valor) {
    const d = document.createElement('div');
    d.textContent = valor ?? '';
    return d.innerHTML;
  }

  function tempoRelativo(iso) {
    if (!iso) return '';
    const seg = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (seg < 60)    return 'agora';
    if (seg < 3600)  return `há ${Math.floor(seg / 60)} min`;
    if (seg < 86400) return `há ${Math.floor(seg / 3600)} h`;
    if (seg < 172800) return 'ontem';
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  // ── Contador do sino ──────────────────────────────────────────────────────

  function atualizarBadge() {
    const badge = document.getElementById('sino-badge');
    if (!badge) return;

    const alertasPrazo = tipoUsuario === 'aluno' ? (window._prazosAlerta || 0) : 0;
    const total = estado.naoLidas + alertasPrazo;

    badge.textContent   = total > 9 ? '9+' : String(total);
    badge.style.display = total > 0 ? 'flex' : 'none';

    const sino = document.getElementById('sino-notificacoes');
    if (sino) {
      sino.setAttribute('aria-label', total > 0 ? `Notificações (${total} novas)` : 'Notificações');
    }
  }

  // ── Carregamento ──────────────────────────────────────────────────────────

  async function carregar() {
    try {
      const data = await Api.get('/notificacoes');
      if (!data || data.erro) return;

      const itens = data.notificacoes || [];
      const maiorId = itens.reduce((m, n) => Math.max(m, n.id), 0);

      // Toast para o que chegou depois da primeira carga e ainda não foi lido
      if (estado.ultimoIdVisto !== null) {
        const novas = itens.filter(n => n.id > estado.ultimoIdVisto && !n.lida);
        if (novas.length > 0) exibirToast(novas[0], novas.length);
      }
      estado.ultimoIdVisto = Math.max(estado.ultimoIdVisto ?? 0, maiorId);

      estado.itens    = itens;
      estado.naoLidas = data.nao_lidas || 0;
      atualizarBadge();
      if (estado.painel) renderizarPainel();
    } catch (e) {
      console.error('[notificacoes] erro ao carregar:', e);
    }
  }

  function iniciarPolling() {
    clearInterval(estado.timer);
    estado.timer = setInterval(() => {
      if (!document.hidden) carregar();
    }, INTERVALO_MS);
  }

  // ── Marcar como lida ──────────────────────────────────────────────────────

  async function marcarLida(id) {
    const item = estado.itens.find(n => n.id === id);
    if (item && !item.lida) {
      item.lida = true;
      estado.naoLidas = Math.max(0, estado.naoLidas - 1);
      atualizarBadge();
    }
    try { await Api.post('/notificacoes/ler', { id }); } catch (e) { console.error(e); }
  }

  async function marcarTodasLidas() {
    estado.itens.forEach(n => { n.lida = true; });
    estado.naoLidas = 0;
    atualizarBadge();
    renderizarPainel();
    try { await Api.post('/notificacoes/ler-todas', {}); } catch (e) { console.error(e); }
  }

  // ── Painel ────────────────────────────────────────────────────────────────

  function abrirPainel() {
    if (estado.painel) return fecharPainel();

    const painel = document.createElement('div');
    painel.className = 'notif-painel';
    painel.id = 'notif-painel';
    painel.setAttribute('role', 'dialog');
    painel.setAttribute('aria-label', 'Notificações');
    document.body.appendChild(painel);
    estado.painel = painel;

    renderizarPainel();
    posicionarPainel();
    carregar(); // garante dados frescos ao abrir
  }

  function fecharPainel() {
    estado.painel?.remove();
    estado.painel = null;
  }

  function posicionarPainel() {
    const sino = document.getElementById('sino-notificacoes');
    if (!sino || !estado.painel) return;
    const r = sino.getBoundingClientRect();
    const largura = Math.min(360, window.innerWidth - 16);
    const left = Math.min(Math.max(8, r.left + r.width / 2 - largura / 2), window.innerWidth - largura - 8);

    estado.painel.style.width = largura + 'px';
    estado.painel.style.left  = left + 'px';
    estado.painel.style.top   = (r.bottom + 8) + 'px';
  }

  function renderizarPainel() {
    const painel = estado.painel;
    if (!painel) return;

    const lista = estado.itens.length === 0
      ? `<p class="notif-vazio">Nenhuma notificação por aqui.</p>`
      : estado.itens.map(n => {
          const cfg = TIPOS[n.tipo] || { icone: 'clock' };
          return `
            <button type="button" class="notif-item ${n.lida ? '' : 'nao-lida'}" data-id="${n.id}" data-tipo="${esc(n.tipo)}">
              <span class="icon-list ${cfg.icone}"></span>
              <span class="notif-texto">
                <span class="notif-titulo">${esc(n.titulo)}</span>
                <span class="notif-msg">${esc(n.mensagem)}</span>
                <span class="notif-tempo">${esc(tempoRelativo(n.criada_em))}</span>
              </span>
            </button>`;
        }).join('');

    const rodapePrazos = tipoUsuario === 'aluno'
      ? `<button type="button" class="notif-link" id="notif-ver-prazos">Ver prazos de entrega</button>`
      : '';

    painel.innerHTML = `
      <div class="notif-topo">
        <b>Notificações</b>
        <button type="button" class="notif-link" id="notif-marcar-todas" ${estado.naoLidas === 0 ? 'disabled' : ''}>
          Marcar todas como lidas
        </button>
      </div>
      <div class="notif-lista">${lista}</div>
      ${rodapePrazos ? `<div class="notif-rodape">${rodapePrazos}</div>` : ''}`;
  }

  async function aoClicarNoItem(botao) {
    const id   = Number(botao.dataset.id);
    const tipo = botao.dataset.tipo;
    await marcarLida(id);
    fecharPainel();

    const destino = TIPOS[tipo]?.destino;
    if (!destino) return;

    const paginaAtual = window.location.pathname.split('/').pop();
    if (paginaAtual === destino) {
      window.location.reload(); // já está na página: recarrega para mostrar o dado novo
    } else {
      window.location.href = destino;
    }
  }

  // ── Toast (aviso de notificação nova) ─────────────────────────────────────

  function exibirToast(notificacao, quantidade) {
    document.getElementById('notif-toast')?.remove();

    const toast = document.createElement('button');
    toast.type = 'button';
    toast.id = 'notif-toast';
    toast.className = 'notif-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <b>${esc(notificacao.titulo)}</b>
      <span>${esc(notificacao.mensagem)}</span>
      ${quantidade > 1 ? `<small>+ ${quantidade - 1} outra(s) notificação(ões)</small>` : ''}`;
    toast.addEventListener('click', () => { toast.remove(); abrirPainel(); });
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 7000);
  }

  // ── Eventos globais ───────────────────────────────────────────────────────

  document.addEventListener('click', (e) => {
    if (e.target.closest('#sino-notificacoes')) {
      e.preventDefault();
      abrirPainel();
      return;
    }

    const item = e.target.closest('.notif-item');
    if (item) { aoClicarNoItem(item); return; }

    if (e.target.closest('#notif-marcar-todas')) { marcarTodasLidas(); return; }

    if (e.target.closest('#notif-ver-prazos')) {
      fecharPainel();
      if (typeof window.exibirPopupPrazos === 'function') {
        window.exibirPopupPrazos(window._todosPrazos || []);
      }
      return;
    }

    // Clique fora fecha o painel
    if (estado.painel && !e.target.closest('#notif-painel')) fecharPainel();
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharPainel(); });
  window.addEventListener('resize', posicionarPainel);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) carregar(); });

  document.addEventListener('DOMContentLoaded', () => {
    atualizarBadge();
    carregar();
    iniciarPolling();
  });

  // API pública (usada por progresso.js / sino.js para avisar que os alertas de prazo mudaram)
  window.Notificacoes = { atualizarBadge, recarregar: carregar };
})();
