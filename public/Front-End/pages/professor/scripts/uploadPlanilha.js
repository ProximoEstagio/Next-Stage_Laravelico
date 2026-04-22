/**
 * uploadPlanilha.js — Upload CSV com seleção individual (API Laravel)
 */
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileinput');

    const btnSubir = document.querySelector('.btn-V[onclick]');
    if (btnSubir) {
        btnSubir.removeAttribute('onclick');
        btnSubir.addEventListener('click', () => fileInput.click());
    }

    fileInput.addEventListener('change', e => {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        if (arquivo.name.split('.').pop().toLowerCase() !== 'csv') {
            alert('Apenas arquivos .csv são aceitos.');
            fileInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = async event => {
            const alunos = parseCSV(event.target.result);
            if (!alunos.length) { alert('Nenhum aluno encontrado no arquivo.'); return; }

            // Verifica duplicatas no banco e na própria planilha
            const duplicatas = await Api.post('/professor/alunos/verificar', { alunos });
            mostrarPreview(alunos, duplicatas?.ras || [], duplicatas?.emails || []);
        };
        reader.readAsText(arquivo, 'UTF-8');
    });

    // ── Parse CSV ─────────────────────────────────────────────────────────────

    function parseCSV(texto) {

        const linhas = texto
            .trim()
            .split(/\r?\n/);

        if (linhas.length < 2) return [];

        // limpa BOM + lixo no final
        const primeiraLinha = linhas[0]
            .replace(/^\uFEFF/, '')
            .replace(/;+$/g, '');

        const sep = primeiraLinha.includes(';') ? ';' : ',';

        const cabecalho = primeiraLinha
            .split(sep)
            .map(c => c.trim().toLowerCase());

        console.log('CABECALHO RAW:', primeiraLinha);
        console.log('CABECALHO PARSEADO:', cabecalho);

        const colMap = {
            nome:     ['nome', 'name'],
            ra:       ['ra', 'r.a.', 'ra.', 'registro acadêmico'],
            email:    ['email', 'e-mail'],
            semestre: ['semestre', 'sem'],
        };
        const indices = {};
        for (const [campo, variantes] of Object.entries(colMap)) {
            indices[campo] = cabecalho.findIndex(c => variantes.includes(c));
        }

        console.log('CABECALHO PARSEADO:', cabecalho);
        const alunos = [];
        for (let i = 1; i < linhas.length; i++) {
        const cols = linhas[i]
            .replace(/;+$/g, '')
            .split(sep)
            .map(c => c.trim().replace(/^"|"$/g, ''));
            if (cols.every(c => !c)) continue;
            alunos.push({
                nome:     indices.nome     >= 0 ? cols[indices.nome]     : '',
                ra:       indices.ra       >= 0 ? cols[indices.ra].replace(/\D/g, '').slice(0, 13) : '',
                email:    indices.email    >= 0 ? cols[indices.email]    : '',
                semestre: indices.semestre >= 0 ? cols[indices.semestre] : '',
            });
        }
        return alunos;
    }

    // ── Preview com seleção individual ────────────────────────────────────────

    async function mostrarPreview(alunos, rasNoBanco, emailsNoBanco) {
        document.getElementById('preview-container')?.remove();

        // Detecta RAs duplicados dentro da própria planilha
        const raCount = {};
        alunos.forEach(a => { if (a.ra) raCount[a.ra] = (raCount[a.ra] || 0) + 1; });
        const rasDuplicadosNaPlanilha = Object.keys(raCount).filter(ra => raCount[ra] > 1);

        const nivel = localStorage.getItem('nivel');
        let selectCursoHtml = '';
        if (nivel === 'admin') {
            const cursos = await Api.get('/admin/cursos');
            selectCursoHtml = `
                <div class="cl g8">
                    <p><b>Selecione o curso dos alunos:</b></p>
                    <select id="csv-curso-select">
                        <option value="">Selecione um curso</option>
                        ${(cursos || []).map(c => `<option value="${c.idcurso}">${c.nomeCurso}</option>`).join('')}
                    </select>
                </div>`;
        }

        const div = document.createElement('div');
        div.id        = 'preview-container';
        div.className = 'container cl';
        div.style.marginTop = '16px';

        const linhas = alunos.map((a, i) => {
            const formatoOk       = a.nome && a.ra && a.email && a.semestre && /^\d{13}$/.test(a.ra);
            const raNoBanco       = rasNoBanco.includes(a.ra);
            const emailNoBanco    = emailsNoBanco.includes(a.email);
            const raDupPlanilha   = rasDuplicadosNaPlanilha.includes(a.ra);
            const temProblema     = !formatoOk || raNoBanco || emailNoBanco || raDupPlanilha;

            let statusHtml;
            let motivo = '';

            if (!formatoOk) {
                motivo     = 'Dados inválidos';
                statusHtml = `<span style="color:red">✗ ${motivo}</span>`;
            } else if (raDupPlanilha) {
                motivo     = 'RA duplicado na planilha';
                statusHtml = `<span style="color:orange">⚠ ${motivo}</span>`;
            } else if (raNoBanco) {
                motivo     = 'RA já cadastrado';
                statusHtml = `<span style="color:orange">⚠ ${motivo}</span>`;
            } else if (emailNoBanco) {
                motivo     = 'Email já cadastrado';
                statusHtml = `<span style="color:orange">⚠ ${motivo}</span>`;
            } else {
                statusHtml = `<span style="color:green">✓ válido</span>`;
            }

            const raHtml = /^\d{13}$/.test(a.ra)
                ? `<span style="${raNoBanco || raDupPlanilha ? 'color:orange' : ''}">${a.ra}</span>`
                : `<span style="color:red">${a.ra || 'vazio'} (13 dígitos)</span>`;

            return `
                <tr id="linha-aluno-${i}" style="${temProblema ? 'opacity:0.6;background:#fff5f5' : ''}">
                    <td style="width:36px;text-align:center;">
                        <input type="checkbox" id="check-aluno-${i}"
                            ${formatoOk && !raNoBanco && !emailNoBanco && !raDupPlanilha ? 'checked' : ''}
                            ${!formatoOk ? 'disabled' : ''}
                            onchange="toggleLinhaAluno(${i})"
                            style="width:18px;height:18px;cursor:pointer;">
                    </td>
                    <td>${a.nome || '<span style="color:red">vazio</span>'}</td>
                    <td>${raHtml}</td>
                    <td style="${emailNoBanco ? 'color:orange' : ''}">${a.email || '<span style="color:red">vazio</span>'}</td>
                    <td>${a.semestre || '<span style="color:red">vazio</span>'}</td>
                    <td>${statusHtml}</td>
                    <td style="text-align:center;">
                    <button onclick="removerAluno(${i})" style="
                        background:none;
                        border:none;
                        cursor:pointer;
                        color:red;
                        font-size:16px;">
                        ❌
                    </button>
                    </td>
                </tr>`;
        }).join('');

        const totalValidos = alunos.filter((a, i) => {
            return a.nome && a.ra && a.email && a.semestre &&
                   /^\d{13}$/.test(a.ra) &&
                   !rasNoBanco.includes(a.ra) &&
                   !emailsNoBanco.includes(a.email) &&
                   !rasDuplicadosNaPlanilha.includes(a.ra);
        }).length;

        div.innerHTML = `
            <div class="topV rw jc-sb">
                <p class="TopTxt">Preview — ${alunos.length} aluno(s) encontrado(s)</p>
                <p class="TopTxt" id="contador-selecionados">${totalValidos} selecionado(s)</p>
            </div>
            <div class="cl p16 g16">
                ${selectCursoHtml}
                <div class="rw g8">
                    <button class="btn-link fc" onclick="selecionarTodos(true)">Selecionar todos válidos</button>
                    <button class="btn-link fc" onclick="selecionarTodos(false)">Desmarcar todos</button>
                </div>
                <div class="tabela-alunos">
                    <table>
                        <thead>
                            <tr style="background:var(--cinza-paleta)">
                                <th style="width:36px"></th>
                                <th><p>Nome</p></th>
                                <th><p>R.A.</p></th>
                                <th><p>Email</p></th>
                                <th><p>Semestre</p></th>
                                <th><p>Status</p></th>
                                <th style="width:40px"></th>
                            </tr>
                        </thead>
                        <tbody>${linhas}</tbody>
                    </table>
                </div>
                <div class="rw g16">
                    <button id="btn-cancelar-csv" class="btn-link fc">Cancelar</button>
                    <button id="btn-confirmar-csv" class="btn-V">Confirmar Cadastro</button>
                </div>
            </div>`;

        const content = document.querySelector('.content');
        content.insertBefore(div, content.querySelector('.grid-col').nextSibling);

        // Salva dados para uso nos callbacks
        div._alunos            = alunos;
        div._rasNoBanco        = rasNoBanco;
        div._emailsNoBanco     = emailsNoBanco;
        div._rasDupPlanilha    = rasDuplicadosNaPlanilha;

        document.getElementById('btn-cancelar-csv').addEventListener('click', () => {
            div.remove();
            fileInput.value = '';
        });

        document.getElementById('btn-confirmar-csv').addEventListener('click', () => {
            const cursoId = document.getElementById('csv-curso-select')?.value || null;
            if (nivel === 'admin' && !cursoId) {
                alert('Selecione o curso antes de confirmar.');
                return;
            }

            // Pega só os selecionados
            // const selecionados = alunos.filter((a, i) => {
            //     const cb = document.getElementById(`check-aluno-${i}`);
            //     return cb && cb.checked && !cb.disabled;
            // });

            //teste
            const selecionados = alunos.filter((a, i) => {
                if (a._removido) return false;

                const cb = document.getElementById(`check-aluno-${i}`);
                return cb && cb.checked && !cb.disabled;
            });

            if (!selecionados.length) {
                alert('Nenhum aluno selecionado.');
                return;
            }

            enviarAlunos(selecionados, div, cursoId);
        });
    }

    window.removerAluno = function(i) {
    const div = document.getElementById('preview-container');
    if (!div) return;

    // Marca como removido
    div._alunos[i]._removido = true;

    const linha = document.getElementById(`linha-aluno-${i}`);
    if (linha) linha.remove();

    atualizarContador();
    };
    // ── Helpers de seleção ────────────────────────────────────────────────────

    window.toggleLinhaAluno = function(i) {
        const cb    = document.getElementById(`check-aluno-${i}`);
        const linha = document.getElementById(`linha-aluno-${i}`);
        if (linha) linha.style.opacity = cb?.checked ? '1' : '0.6';
        atualizarContador();
    };

    window.selecionarTodos = function(selecionar) {
        const div = document.getElementById('preview-container');
        if (!div) return;

        div._alunos.forEach((a, i) => {
            const cb = document.getElementById(`check-aluno-${i}`);
            if (!cb || cb.disabled) return;

            // Ao selecionar todos, só marca os válidos (sem problemas)
            if (selecionar) {
                const temProblema = div._rasNoBanco.includes(a.ra) ||
                                    div._emailsNoBanco.includes(a.email) ||
                                    div._rasDupPlanilha.includes(a.ra);
                cb.checked = !temProblema;
            } else {
                cb.checked = false;
            }

            const linha = document.getElementById(`linha-aluno-${i}`);
            if (linha) linha.style.opacity = cb.checked ? '1' : '0.6';
        });

        atualizarContador();
    };

    function atualizarContador() {
        const checks = document.querySelectorAll('[id^="check-aluno-"]:checked:not(:disabled)');
        const el = document.getElementById('contador-selecionados');
        if (el) el.textContent = checks.length + ' selecionado(s)';
    }

    // ── Enviar ────────────────────────────────────────────────────────────────

    async function enviarAlunos(alunos, previewDiv, cursoId = null) {
        const btn = document.getElementById('btn-confirmar-csv');
        btn.disabled    = true;
        btn.textContent = 'Cadastrando...';

        const professorId = localStorage.getItem('idprofessor');
        const body = { alunos, professor_id: professorId };
        if (cursoId) body.curso_id = cursoId;

        const data = await Api.post('/professor/alunos/csv', body);

        let msg = `✅ ${data.total_ok} aluno(s) cadastrado(s) com sucesso!`;
        if (data.total_falho > 0) {
            msg += `\n\n⚠️ ${data.total_falho} não cadastrado(s):\n`;
            data.falhos.forEach(f => {
                msg += `- ${f.aluno.nome || f.aluno.ra}: ${f.motivo}\n`;
            });
        }

        alert(msg);
        previewDiv.remove();
        fileInput.value = '';
        if (typeof carregarAlunos === 'function') carregarAlunos();
    }
});