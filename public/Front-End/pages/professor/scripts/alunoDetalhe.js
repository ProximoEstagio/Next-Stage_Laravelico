/**
 * alunoDetalhe.js — Professor (API Laravel)
 */
document.addEventListener('DOMContentLoaded', async () => {
    const params  = new URLSearchParams(window.location.search);
    const alunoId = params.get('id');

    if (!alunoId) {
        document.querySelector('.content').innerHTML = '<p style="padding:32px">Aluno não identificado.</p>';
        return;
    }

    const data = await Api.post('/professor/aluno/detalhe', { aluno_id: alunoId });
    if (!data || data.erro) { console.error(data?.erro); return; }

    const { aluno, documentos } = data;

    // Preenche perfil
    document.getElementById('foto-aluno').src = aluno.foto
        ? `${window.BASE}/storage/${aluno.foto}`
        : '../../public/imagens/ft-perfil.png';

    document.getElementById('aluno-nome').textContent     = aluno.nome      || '-';
    document.getElementById('aluno-ra').textContent       = aluno.ra         || '-';
    document.getElementById('aluno-email').textContent    = aluno.email      || '-';
    document.getElementById('aluno-curso').textContent    = aluno.nomeCurso  || '-';
    document.getElementById('aluno-telefone').textContent = aluno.telefone   || '-';
    document.getElementById('aluno-semestre').textContent = aluno.semestre ? aluno.semestre + 'º Semestre' : '-';

    // Botão concluir
    const concluido  = aluno.concluido == 1;
    const btnConcluir = document.getElementById('btn-concluir');
    if (btnConcluir) {
        btnConcluir.textContent = concluido ? 'Remover Conclusão' : 'Marcar como Concluído';
        btnConcluir.className   = concluido ? 'btn-link fc' : 'btn-V fc';
        btnConcluir.onclick     = () => toggleConcluido(aluno.idaluno, !concluido);
    }

    await carregarPrazos(alunoId);

    // Documentos
    const container = document.getElementById('documentos-container');
    if (!documentos.length) {
        container.innerHTML = `<div class="container cl p16 cc"><p class="fs16"><b>Nenhum documento enviado ainda</b></p></div>`;
        return;
    }

    container.innerHTML = documentos.map(doc => {
        const iconClass = getIconClass(doc.status);
        const dataFmt   = new Date(doc.dataEmissao).toLocaleDateString('pt-BR');
        const caminho   = doc.caminho_arquivo ? `${window.BASE}/storage/${doc.caminho_arquivo}` : null;

        return `
        <div class="container cl">
            <div class="topV rw jc-sb">
                <p class="TopTxt">${doc.descricao || '(sem nome)'}</p>
                <span class="icon-list ${iconClass}"></span>
            </div>
            <div class="cl p16 g16">
                <div class="cl g8">
                    <p>Tipo do Documento : ${doc.tipo}</p>
                    <p>Status : ${doc.status}</p>
                    <p>Data de Criação : ${dataFmt}</p>
                </div>
                ${doc.feedback ? `
                    <div class="feedback">
                        <div class="jc-sb rw"><p>Feedback :</p><p>${doc.status}</p></div>
                        <p>${doc.feedback}</p>
                    </div>` : ''}
                ${caminho ? `
                    <button class="btn-link fc" onclick="window.open('${caminho}', '_blank')">
                        <span class="icon-link"></span> Abrir Documento
                    </button>` : ''}
            </div>
        </div>`;
    }).join('');
});

async function carregarPrazos(alunoId) {
    const prazos = await Api.get('/professor/prazos', { aluno_id: alunoId });
    const container = document.getElementById('prazos-container');
    if (!container || !prazos) return;

    container.innerHTML = prazos.map(p => {
        const prazoFmt = p.prazoFinal
            ? new Date(p.prazoFinal + 'T00:00:00').toLocaleDateString('pt-BR')
            : 'Não definido';
        const vencido = p.prazoFinal && new Date(p.prazoFinal) < new Date();

        return `
        <div class="rw g16 jc-sb">
            <div class="cl g4">
                <p class="fs16"><b>Documento ${p.tipo}</b></p>
                <p style="color:${vencido ? 'var(--off)' : 'var(--cinza)'}">
                    Prazo: ${prazoFmt} ${vencido ? '⚠️ Vencido' : ''}
                </p>
                ${p.intervalo_dias ? `<p style="font-size:12px;opacity:0.6">${p.intervalo_dias} dias após doc anterior</p>` : ''}
            </div>
            <div class="rw g8 fc">
                <input type="date" id="prazo-${p.idtipo}" value="${p.dataLimite || ''}" style="width:160px">
                <button class="btn-C fc" onclick="salvarPrazo(${alunoId}, ${p.idtipo})">Salvar</button>
                ${p.dataLimite ? `<button class="btn-link fc" onclick="removerPrazo(${alunoId}, ${p.idtipo})">Remover</button>` : ''}
            </div>
        </div>`;
    }).join('');
}

async function salvarPrazo(alunoId, tipoId) {
    const dataLimite = document.getElementById(`prazo-${tipoId}`)?.value;
    const data = await Api.post('/professor/prazos', { aluno_id: alunoId, tipo_id: tipoId, dataLimite });
    if (data?.ok) await carregarPrazos(alunoId);
    else alert(data?.erro || 'Erro ao salvar prazo.');
}

async function removerPrazo(alunoId, tipoId) {
    const data = await Api.post('/professor/prazos', { aluno_id: alunoId, tipo_id: tipoId, dataLimite: null });
    if (data?.ok) await carregarPrazos(alunoId);
}

async function toggleConcluido(alunoId, concluido) {
    if (!confirm(concluido
        ? 'Marcar este aluno como concluído? Ele ficará visível para a secretaria.'
        : 'Remover conclusão deste aluno?')) return;

    const data = await Api.post('/professor/aluno/concluir', { aluno_id: alunoId, concluido: concluido ? 1 : 0 });
    if (data?.ok) {
        const btn = document.getElementById('btn-concluir');
        btn.textContent = concluido ? 'Remover Conclusão' : 'Marcar como Concluído';
        btn.className   = concluido ? 'btn-link fc' : 'btn-V fc';
        btn.onclick     = () => toggleConcluido(alunoId, !concluido);
    } else {
        alert(data?.erro || 'Erro ao atualizar.');
    }
}

function getIconClass(status) {
    return { Validado: 'check', Invalidado: 'off', Visualizado: 'eye', 'Não Avaliado': 'clock' }[status] || 'clock';
}
