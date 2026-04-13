document.addEventListener("DOMContentLoaded", function () {
  const popupElement = document.querySelector("#popup-layer");

  if (popupElement) {
    popupElement.innerHTML = `
            <div class="popup container">

                <div class="topV rw jc-sb">
                    <p class="TopTxt">Nome do Documento</p>
                    <p id="popup-tipo" class="TopTxt">Tipo do Documento : </p>
                    <div class="rw fc g8">
                        <p id="popup-status-txt" class="TopTxt">Status : </p>
                        <span id="popup-status-icon" class="icon-list clock"></span>
                    </div>
                    <span id="close-popup" class="icon closeW"></span>
                </div>

                <div class="cl g16 p16">

                    <div class="cl g8">
                        <p>Aluno</p>
                        <div class="information-container">
                            <div class="rw g8">
                                <p>Nome :</p>
                                <p id="popup-nome-aluno" class="fs16"></p>
                            </div>
                            <div class="rw g8">
                                <p>R.A. :</p>
                                <p id="popup-ra" class="fs16"></p>
                            </div>
                            <div class="rw g8">
                                <p>Data de envio :</p>
                                <p id="popup-data" class="fs16"></p>
                            </div>
                        </div>
                    </div>

                    <div class="cl g8">
                        <p>Recado do Aluno</p>
                        <div class="information-container">
                            <p id="popup-recado"></p>
                        </div>
                    </div>

                    <button id="btn-abrir-doc" class="btn-link">
                        <span class="icon-link"></span>
                        <p>Abrir Documento</p>
                    </button>

                    <div class="g8 cl">
                        <p>Adicione um feedback para o aluno</p>
                        <textarea name="feedback" id="feedback"></textarea>
                    </div>

                    <div class="rw g16">
                        <button id="btn-invalidar" class="btn-invalidar">
                            <p>Invalidar</p>
                        </button>
                        <button id="btn-validar" class="btn-validar">
                            <p>Validar</p>
                        </button>
                    </div>

                </div>
            </div>
        `;
  }
});
