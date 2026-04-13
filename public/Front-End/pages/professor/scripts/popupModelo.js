/**
 * popupModelo.js — Upload de modelo de documento (API Laravel)
 */
document.addEventListener('DOMContentLoaded', function () {
    const popupLayer = document.querySelector('#popup-layer');
    let tipoSelecionado = '';

    if (!popupLayer) return;

    popupLayer.innerHTML = `
        <div class="popup slim container">
            <div class="topV rw jc-sb">
                <p class="TopTxt">Criar novo Modelo de Documento</p>
                <span id="close-popup" class="icon closeW"></span>
            </div>
            <div class="cl g16 p16">
                <div class="cl g8">
                    <p>Instruções para os alunos <span style="opacity:0.6;font-size:12px">(opcional)</span></p>
                    <textarea id="instrucoes"></textarea>
                </div>
                <p id="tipoSelecionadoTxt" style="font-weight:bold;color:#444"></p>
                <p id="nomeArquivoText" style="font-size:14px;color:#555"></p>
                <button class="btn-F" id="btnUpload">Selecionar Documento de Modelo</button>
                <input type="file" id="fileinput" style="display:none">
                <button class="btn-V" id="btnSalvarModelo">Salvar Modelo</button>
            </div>
        </div>`;

    // Abrir popup
    document.querySelectorAll("[data-open-popup='modelo']").forEach(btn => {
        btn.addEventListener('click', () => {
            tipoSelecionado = btn.getAttribute('data-tipo') || '';
            popupLayer.classList.add('active');
            document.body.style.overflow = 'hidden';
            document.getElementById('tipoSelecionadoTxt').textContent =
                tipoSelecionado ? `Tipo selecionado: ${tipoSelecionado}` : 'Tipo não definido';
        });
    });

    document.getElementById('close-popup').addEventListener('click', () => {
        popupLayer.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    popupLayer.addEventListener('click', e => {
        if (e.target === popupLayer) {
            popupLayer.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Arquivo
    document.getElementById('btnUpload').addEventListener('click', () =>
        document.getElementById('fileinput').click()
    );
    document.getElementById('fileinput').addEventListener('change', e => {
        const arquivo = e.target.files[0];
        document.getElementById('nomeArquivoText').textContent = arquivo ? arquivo.name + ' anexado' : '';
    });

    // Salvar
    document.getElementById('btnSalvarModelo').addEventListener('click', async () => {
        const instrucoes = document.getElementById('instrucoes').value.trim();
        const arquivo    = document.getElementById('fileinput').files[0];

        if (!arquivo || !tipoSelecionado) {
            alert('Selecione um arquivo e defina o tipo antes de salvar.');
            return;
        }

        const formData = new FormData();
        formData.append('instrucoes',    instrucoes);
        formData.append('tipoDocumento', tipoSelecionado);
        formData.append('arquivo',       arquivo);
        formData.append('professor_id',  localStorage.getItem('idprofessor') || '1');

        const data = await Api.upload('/professor/modelos/upload', formData);

        if (data?.success) {
            alert(`Modelo do tipo ${tipoSelecionado} salvo com sucesso!`);
            document.getElementById('instrucoes').value = '';
            document.getElementById('fileinput').value  = '';
            document.getElementById('nomeArquivoText').textContent = '';
            popupLayer.classList.remove('active');
            document.body.style.overflow = 'auto';
            location.reload();
        } else {
            alert('Erro ao salvar: ' + (data?.message || 'Erro desconhecido.'));
        }
    });
});
