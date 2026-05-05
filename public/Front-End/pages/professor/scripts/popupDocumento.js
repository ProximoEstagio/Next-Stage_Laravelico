/**
 * popupDocumento.js — Popup de validação com correção pelo professor (API Laravel)
 */
document.addEventListener("DOMContentLoaded", function () {
  const popupElement = document.querySelector("#popup-layer");
  if (!popupElement) return;

  popupElement.innerHTML = `
        <div class="popup container">
            <div class="topV rw jc-sb">
                <p class="TopTxt">Nome do Documento</p>
                <p id="popup-tipo" class="TopTxt">Tipo : </p>
                <div class="rw fc g8">
                    <p id="popup-status-txt" class="TopTxt">Status : </p>
                    <span id="popup-status-icon" class="icon-list clock"></span>
                </div>
                <span id="close-popup" class="icon closeW"></span>
            </div>

            <div class="cl g16 p16">

                <!-- Info do aluno -->
                <div class="cl g8">
                    <p>Aluno</p>
                    <div class="information-container">
                        <div class="rw g8"><p>Nome :</p><p id="popup-nome-aluno" class="fs16"></p></div>
                        <div class="rw g8"><p>R.A. :</p><p id="popup-ra" class="fs16"></p></div>
                        <div class="rw g8"><p>Data de envio :</p><p id="popup-data" class="fs16"></p></div>
                        <div id="popup-corrigido-badge" style="display:none">
                            <span style="
                                background:var(--eye-50);
                                border:1px solid var(--eye);
                                color:var(--eye);
                                font-size:12px;
                                padding:2px 8px;
                                border-radius:4px;
                                font-weight:600;">
                                ✏️ Corrigido pelo professor
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Recado -->
                <div class="cl g8">
                    <p>Recado do Aluno</p>
                    <div class="information-container">
                        <p id="popup-recado"></p>
                    </div>
                </div>

                <!-- Botão abrir documento -->
                <button id="btn-abrir-doc" class="btn-link fc" style="display:none">
                    <span class="icon-link"></span>
                    <p>Abrir Documento</p>
                </button>

                <!-- Feedback -->
                <div class="g8 cl">
                    <p>Adicione um feedback para o aluno</p>
                    <textarea name="feedback" id="feedback"></textarea>
                </div>

                <!-- Ações principais -->
                <div class="rw g16">
                    <button id="btn-invalidar" class="btn-invalidar"><p>Invalidar</p></button>
                    <button id="btn-validar"   class="btn-validar"><p>Validar</p></button>
                </div>

                <!-- Correção pelo professor -->
                <div class="container cl" style="border:1px solid var(--eye);border-radius:5px;overflow:visible;">
                    <div style="background:var(--eye-50);padding:12px 16px;">
                        <p style="color:var(--eye);font-weight:600;font-size:14px;">
                            ✏️ Corrigir documento (opcional)
                        </p>
                        <p style="font-size:12px;opacity:0.8;margin-top:4px;">
                            Anexe uma versão corrigida. O sistema registrará como enviado pelo professor.
                        </p>
                    </div>
                    <div class="cl p16 g8">
                        <p id="nome-arquivo-correcao" style="font-size:13px;opacity:0.6"></p>
                        <div class="rw g8">
                            <button class="btn-F fc" id="btn-selecionar-correcao">
                                Selecionar arquivo corrigido
                            </button>
                            <input type="file" id="input-correcao" style="display:none">
                            <button id="btn-enviar-correcao" class="btn-C fc" style="display:none">
                                Enviar Correção
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>`;
});
