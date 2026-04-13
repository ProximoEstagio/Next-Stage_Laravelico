document.addEventListener("DOMContentLoaded", function () {
    const popupElement = document.querySelector('#popup-layer');

    if (popupElement) {
        popupElement.innerHTML = `

            <!-- popup -->


            <div class="popup container">

                <div class="cl al-fe p8"><span id="close-popup" class="icon close"></span></div>

                <div class="cl cc" style="padding-bottom: 48px;">
                    <div class="w80c cl">
                        <p class="fs36" style="font-weight: 1000; color: var(--vermelho);">O QUE É ESTÁGIO?</p>
                        <p class="fs16">Estágio é uma atividade realizada por estudantes que ainda estão cursando o ensino médio, técnico ou superior, com o objetivo de aprender na prática o que estudam na teoria. Ele serve como uma preparação para o mercado de trabalho, permitindo que o aluno desenvolva habilidades profissionais, ganhe experiência e entenda melhor como funciona a sua futura profissão.</p>
                    </div>
                </div>

                <div class="topC cl cc">
                    <div class="g16 w80c cl">
                        <div class="topV cc cl" style="border-radius: 5px; margin-top: -50px;"><p class="TopTxt" style="font-size: 22px;">DOCUMENTOS NECESSÁRIOS PARA VALIDAR ESTÁGIO</p></div>
                        
                        <div class="container p16 cl g16">
                            <div class="grid-150 jc-sb">
                                
                                <div class="cl g8">
                                    <div class="rw al-fe cc"><span class="icon file"></span><p class="fs28" style="font-weight: 600; margin-left: -12px;">A</p></div>
                                    <p class="">O documento A é um termo de aceite. Esse é o primeiro documento a ser entregue</p>
                                </div>
                                <div class="cl g8">
                                    <div class="rw al-fe cc"><span class="icon file"></span><p class="fs28" style="font-weight: 600; margin-left: -12px;">B</p></div>
                                    <p class="">o documento B é um documento relatando suas atividades no estágio. Esse é o segundo a ser entregue</p>
                                </div>
                                <div class="cl g8">
                                    <div class="rw al-fe cc"><span class="icon file"></span><p class="fs28" style="font-weight: 600; margin-left: -12px;">C</p></div>
                                    <p class="">O documento C é um  atestado de conclusão de estágio. Esse é o ultimo a ser entregue</p>
                                </div>

                            </div>
                        </div>
                        
                    </div>
                </div>

            </div>

            


        `;
    }
    
    else {
        console.warn('A tag <div id="popup"> NÃO foi encontrada no documento.');
    }

})



document.addEventListener("DOMContentLoaded", function () {

    const openPopup = document.querySelector("#open-popup"); 
    const closePopup = document.querySelector("#close-popup");
    const popup = document.querySelector("#popup-layer");

    if (!openPopup || !closePopup || !popup) {
        console.warn("Algum dos elementos não foi encontrado.");
        return;
    }

    openPopup.onclick = () => {
        popup.classList.toggle("active");
    };

    closePopup.onclick = () => {
        popup.classList.remove("active");
    };
});



