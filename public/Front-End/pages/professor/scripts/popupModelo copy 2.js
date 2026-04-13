document.addEventListener("DOMContentLoaded", function () {
    const popupLayer = document.querySelector('#popup-layer');
    let tipoSelecionado = ""; // armazena o tipo do documento

    if (popupLayer) {
        popupLayer.innerHTML = `
            <div class="popup slim container">
                <div class="topV rw jc-sb">
                    <p class="TopTxt">Criar novo Modelo de Documento</p>
                    <span id="close-popup" class="icon closeW"></span>
                </div>

                <div class="cl g16 p16">
                    <div class="cl g8">
                        <p>Escreva aqui as instruções que os alunos receberão para preencher esse Modelo</p>
                        <textarea name="instrucoes" id="instrucoes"></textarea>
                    </div>

                    <!-- Mostra o tipo selecionado -->
                    <p id="tipoSelecionadoTxt" style="font-weight: bold; color: #444;"></p>

                    <!-- Texto de aviso do arquivo -->
                    <p id="nomeArquivoText" class="file-name" style="font-size:14px; color:#555; margin-top:8px;"></p>

                    <button class="btn-F" id="btnUpload">
                        <p>Selecionar Documento de Modelo</p>
                    </button>
                    <input type="file" id="fileinput" style="display:none;">

                    <button class="btn-V" id="btnSalvarModelo">
                        <p>Salvar Modelo</p>
                    </button>
                </div>
            </div>
        `;
    } else {
        console.warn('A tag <div id="popup-layer"> NÃO foi encontrada no documento.');
        return;
    }

    // ====== Lógica de abrir e fechar popup ======
    const openPopupList = document.querySelectorAll("[data-open-popup='modelo']");
    const closePopup = document.querySelector("#close-popup");

    if (openPopupList.length === 0 || !closePopup || !popupLayer) {
        console.warn("Algum dos elementos do popup não foi encontrado.");
        return;
    }

    // Abrir popup (agora define o tipo também)
    openPopupList.forEach(button => {
        button.addEventListener("click", function () {
            tipoSelecionado = button.getAttribute("data-tipo") || "";
            popupLayer.classList.add("active");
            document.body.style.overflow = "hidden";

            // Atualiza o texto do tipo no popup
            const tipoTxt = document.getElementById("tipoSelecionadoTxt");
            tipoTxt.textContent = tipoSelecionado
                ? `📄 Tipo selecionado: ${tipoSelecionado}`
                : "❗ Tipo não definido";
        });
    });

    // Fechar popup
    closePopup.addEventListener("click", function () {
        popupLayer.classList.remove("active");
        document.body.style.overflow = "auto";
    });

    // Fechar clicando fora
    popupLayer.addEventListener("click", function (event) {
        if (event.target === popupLayer) {
            popupLayer.classList.remove("active");
            document.body.style.overflow = "auto";
        }
    });

    // ====== Aviso de arquivo anexado ======
    const btnUpload = document.querySelector("#btnUpload");
    const fileInput = document.querySelector("#fileinput");
    const nomeArquivoText = document.querySelector("#nomeArquivoText");

    if (btnUpload && fileInput) {
        btnUpload.addEventListener("click", () => {
            fileInput.click();
        });

        fileInput.addEventListener("change", (e) => {
            const arquivo = e.target.files[0];
            if (arquivo) {
                nomeArquivoText.textContent = `📎 ${arquivo.name} anexado`;
                nomeArquivoText.style.color = "#2d7a2d";
            } else {
                nomeArquivoText.textContent = "";
            }
        });
    }

    // ====== Salvar modelo ======
    const btnSalvar = document.querySelector("#btnSalvarModelo");
    if (btnSalvar) {
        btnSalvar.addEventListener("click", () => {
            const instrucoes = document.querySelector("#instrucoes").value.trim();
            const arquivo = fileInput?.files[0];

            if (!instrucoes || !arquivo || !tipoSelecionado) {
                alert("Preencha as instruções, selecione um arquivo e defina o tipo do documento antes de salvar.");
                return;
            }

            console.log("📄 Modelo salvo:", { instrucoes, tipoSelecionado, arquivo });
            alert(`✅ Modelo do tipo ${tipoSelecionado} salvo com sucesso! (Simulação)`);

            // Limpar campos após salvar
            document.querySelector("#instrucoes").value = "";
            fileInput.value = "";
            nomeArquivoText.textContent = "";
            document.body.style.overflow = "auto";
            popupLayer.classList.remove("active");
        });
    }
    
});
