/**
 * progresso.js — Barra de progresso dinâmica com prazos (API Laravel)
 */
async function carregarProgresso() {
    const alunoId = localStorage.getItem('idaluno');
    if (!alunoId) return;

    try {
        const [data, tipos] = await Promise.all([
            Api.post('/aluno/documentos', { aluno_id: alunoId }),
            Api.get('/aluno/tipos'),
        ]);

        if (data?.erro) return;

        const { ultimos, prazos = [] } = data;
        window._todosPrazos = prazos;

        // ── Barra de progresso ────────────────────────────────────────────────
        // const tiposAtivos = (tipos || []).filter(t => t.ativo);
        
        const tiposAtivos = tipos || [];
        const barra       = document.getElementById('barra-progresso');

        if (barra && tiposAtivos.length) {
            // Monta mapa de status por tipo
            const statusPorTipo = {};
            ultimos.forEach(doc => { statusPorTipo[doc.tipo] = doc.status; });

            // Mapa de prazos por tipo
            const prazoPorTipo = {};
            prazos.forEach(p => { prazoPorTipo[p.tipo] = p; });

            barra.innerHTML = tiposAtivos.map((tipo, i) => {
                const status      = statusPorTipo[tipo.nome];
                // const prazoInfo   = prazoPorTipo[tipo.nome];
                // const proximoTipo = tiposAtivos[i + 1];
                // const prazoInfo = proximoTipo ? prazoPorTipo[proximoTipo.nome] : null;
                let prazoInfo;

                // Primeiro item (A)
                if (i === 0) {
                    const statusAtual = statusPorTipo[tipo.nome];

                    // Se A ainda NÃO foi enviado → usa o próprio prazo
                    if (!statusAtual) {
                        prazoInfo = prazoPorTipo[tipo.nome];
                    } else {
                        // Depois que enviou → segue fluxo normal
                        const proximoTipo = tiposAtivos[i + 1];
                        prazoInfo = proximoTipo ? prazoPorTipo[proximoTipo.nome] : null;
                    }
                } else {
                    // Restante continua normal
                    const proximoTipo = tiposAtivos[i + 1];
                    prazoInfo = proximoTipo ? prazoPorTipo[proximoTipo.nome] : null;
                }
                const isLast      = i === tiposAtivos.length - 1;

                // Percentual da barra baseado no status
                let progWidth = 0;
                if (status === 'Validado')    progWidth = 100;
                else if (status === 'Visualizado' || status === 'Invalidado') progWidth = 50;
                else if (status === 'Não Avaliado') progWidth = 25;

                // Cor da bolinha
                let circleClass = 'circle';
                if (status === 'Validado')    circleClass = 'circleComplete';
                else if (status === 'Visualizado') circleClass = 'circleVisualizado';
                else if (status === 'Invalidado')  circleClass = 'circleInvalidado';
                else if (status === 'Não Avaliado') circleClass = 'circleEnviado';

                // Texto do prazo
                let prazoHtml = '';
                if (prazoInfo?.prazoFinal) {
                    const dataFmt     = new Date(prazoInfo.prazoFinal + 'T00:00:00').toLocaleDateString('pt-BR');
                    const hoje        = new Date();
                    hoje.setHours(0, 0, 0, 0);
                    const limite      = new Date(prazoInfo.prazoFinal + 'T00:00:00');
                    const diffMs      = limite - hoje;
                    const diffDias    = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

                    let contagemTxt;
                    let corPrazo = 'var(--cinza)';

                    if (prazoInfo.jaEnviou && status === 'Validado') {
                        contagemTxt = '✓ Concluído';
                        corPrazo    = 'var(--check)';
                    } else if (diffDias < 0) {
                        contagemTxt = `${Math.abs(diffDias)} dias atraso`;
                        corPrazo    = 'var(--off)';
                    } else if (diffDias === 0) {
                        contagemTxt = 'Vence hoje';
                        corPrazo    = 'var(--off)';
                    } else if (diffDias <= 7) {
                        contagemTxt = `${diffDias} dia${diffDias > 1 ? 's' : ''} restante${diffDias > 1 ? 's' : ''}`;
                        corPrazo    = 'var(--clock)';
                    } else {
                        contagemTxt = `${diffDias} dias restantes`;
                        corPrazo    = 'var(--cinza)';
                    }

                    prazoHtml = `
                        <div class="prazo-info" style="color:${corPrazo}">
                            <p class="prazo-data">${dataFmt}</p>
                            <p class="prazo-contagem">${contagemTxt}</p>
                        </div>`;
                } else {
                    prazoHtml = `<div class="prazo-info"><p class="prazo-data" style="opacity:0"> </p></div>`;
                }

                return `
                    <div class="progress-item">
                        ${prazoHtml}
                        <div class="progress-circle-row">
                            <div id="circle-${tipo.nome}" class="${circleClass}">
                                <p>${tipo.nome}</p>
                            </div>
                            ${!isLast ? `
                            <div id="prog-${tipo.nome}" class="progBar">
                                <div class="progProgres" style="width:${progWidth}%"></div>
                            </div>` : ''}
                        </div>
                    </div>`;
            }).join('');
        }

        // ── Sino ─────────────────────────────────────────────────────────────
        const notificacoes = prazos.filter(p => p.vencido || p.urgente);
        atualizarSino(notificacoes, prazos);

        if (notificacoes.length > 0 && !sessionStorage.getItem('notif_exibida')) {
            exibirPopupNotificacoes(notificacoes);
            sessionStorage.setItem('notif_exibida', '1');
        }

        // ── Último documento ─────────────────────────────────────────────────
        const container = document.getElementById('ultimo-doc-content');
        if (!container) return;

        if (!ultimos.length) {
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

function getIconClassAluno(status) {
    return { Validado: 'check', Invalidado: 'off', Visualizado: 'eye', 'Não Avaliado': 'clock' }[status] || 'clock';
}

document.addEventListener('DOMContentLoaded', () => {
    carregarProgresso();
    document.addEventListener('abrirPrazos', () => {
        if (window._todosPrazos) exibirPopupPrazos(window._todosPrazos);
    });
});