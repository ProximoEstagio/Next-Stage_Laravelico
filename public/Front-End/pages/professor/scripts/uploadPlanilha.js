/**
 * uploadPlanilha.js — Upload CSV de alunos (API Laravel)
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
        reader.onload = event => {
            const alunos = parseCSV(event.target.result);
            if (!alunos.length) { alert('Nenhum aluno válido encontrado no arquivo.'); return; }
            mostrarPreview(alunos);
        };
        reader.readAsText(arquivo, 'UTF-8');
    });

    function parseCSV(texto) {
        const linhas    = texto.trim().split('\n');
        if (linhas.length < 2) return [];
        const sep       = linhas[0].includes(';') ? ';' : ',';
        const cabecalho = linhas[0].split(sep).map(c => c.trim().toLowerCase());

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

        const alunos = [];
        for (let i = 1; i < linhas.length; i++) {
            const cols = linhas[i].split(sep).map(c => c.trim().replace(/^"|"$/g, ''));
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

    function mostrarPreview(alunos) {
        document.getElementById('preview-container')?.remove();

        const div = document.createElement('div');
        div.id        = 'preview-container';
        div.className = 'container cl';
        div.style.marginTop = '16px';

        div.innerHTML = `
            <div class="topV rw jc-sb">
                <p class="TopTxt">Preview — ${alunos.length} aluno(s)</p>
            </div>
            <div class="cl p16 g16">
                <div class="tabela-alunos">
                    <table>
                        <thead>
                            <tr style="background:var(--cinza-paleta)">
                                <th><p>Nome</p></th><th><p>R.A.</p></th>
                                <th><p>Email</p></th><th><p>Semestre</p></th><th><p>Status</p></th>
                            </tr>
                        </thead>
                        <tbody>
                        ${alunos.map(a => {
                            const valido = a.nome && a.ra && a.email && a.semestre && /^\d{13}$/.test(a.ra);
                            const raHtml = /^\d{13}$/.test(a.ra) ? a.ra : `<span style="color:red">${a.ra || 'vazio'} (13 dígitos)</span>`;
                            return `<tr>
                                <td>${a.nome  || '<span style="color:red">vazio</span>'}</td>
                                <td>${raHtml}</td>
                                <td>${a.email || '<span style="color:red">vazio</span>'}</td>
                                <td>${a.semestre || '<span style="color:red">vazio</span>'}</td>
                                <td>${valido
                                    ? '<span style="color:green">✓ válido</span>'
                                    : '<span style="color:red">✗ inválido</span>'}</td>
                            </tr>`;
                        }).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="rw g16">
                    <button id="btn-cancelar-csv" class="btn-link fc">Cancelar</button>
                    <button id="btn-confirmar-csv" class="btn-V">Confirmar Cadastro</button>
                </div>
            </div>`;

        const content = document.querySelector('.content');
        content.insertBefore(div, content.querySelector('.grid-col').nextSibling);

        document.getElementById('btn-cancelar-csv').addEventListener('click', () => {
            div.remove();
            fileInput.value = '';
        });
        document.getElementById('btn-confirmar-csv').addEventListener('click', () => {
            enviarAlunos(alunos, div);
        });
    }

    async function enviarAlunos(alunos, previewDiv) {
        const btn = document.getElementById('btn-confirmar-csv');
        btn.disabled    = true;
        btn.textContent = 'Cadastrando...';

        const professorId = localStorage.getItem('idprofessor');
        const data = await Api.post('/professor/alunos/csv', { alunos, professor_id: professorId });

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
