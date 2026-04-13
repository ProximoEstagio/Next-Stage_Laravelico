/**
 * sino.js — Notificações de prazo (API Laravel)
 * Usado nas páginas que NÃO são a area_aluno (onde o progresso.js já cuida disso)
 */
document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.pathname.includes('area_aluno')) return;

    const alunoId = localStorage.getItem('idaluno');
    if (!alunoId) return;

    try {
        const data = await Api.post('/aluno/documentos', { aluno_id: alunoId });
        if (!data || data.erro) return;

        const prazos       = data.prazos || [];
        const notificacoes = prazos.filter(p => p.vencido || p.urgente);

        window._todosPrazos = prazos;

        const badge = document.getElementById('sino-badge');
        if (badge) {
            badge.textContent   = notificacoes.length;
            badge.style.display = notificacoes.length > 0 ? 'flex' : 'none';
        }

        if (notificacoes.length > 0 && !sessionStorage.getItem('notif_exibida')) {
            exibirPopupNotificacoes(notificacoes);
            sessionStorage.setItem('notif_exibida', '1');
        }
    } catch (e) {
        console.error('Erro ao carregar sino:', e);
    }
});

document.addEventListener('click', (e) => {
    if (e.target.closest('#sino-notificacoes')) {
        if (window._todosPrazos) exibirPopupPrazos(window._todosPrazos);
    }
});

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
                    const cor  = p.vencido ? 'var(--off)' : p.urgente ? 'var(--clock)' : 'var(--cinza)';
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
