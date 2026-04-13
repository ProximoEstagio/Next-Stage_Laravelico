/**
 * uploadDoc.js — Envio de documentos pelo aluno (API Laravel)
 */
document.addEventListener('DOMContentLoaded', () => {
  const alunoId = localStorage.getItem('idaluno');

  // ── Carregar tipos ──────────────────────────────────────────────────────────
  const tipoDropdown = document.getElementById('tipoDoc');

  Api.get('/aluno/tipos').then(tipos => {
    if (!Array.isArray(tipos)) return;
    tipos.forEach(tipo => {
      const opt = document.createElement('option');
      opt.value       = tipo.idtipo;
      opt.textContent = tipo.nome;
      tipoDropdown.appendChild(opt);
    });
  }).catch(err => console.error('Erro ao carregar tipos:', err));

  // ── Exibir nome do arquivo ──────────────────────────────────────────────────
  const fileInput       = document.getElementById('fileinput');
  const nomeArquivoText = document.getElementById('nomeArquivoText');

  fileInput.addEventListener('change', e => {
    nomeArquivoText.textContent = e.target.files[0]?.name || '';
  });

  // ── Enviar documento ────────────────────────────────────────────────────────
  const btnEnviar    = document.querySelector(".btn-C[type='button']");
  const recadoInput  = document.getElementById('Recado');
  const nomeDocInput = document.getElementById('nomeDoc');

  btnEnviar.addEventListener('click', async () => {
    const arquivo = fileInput.files[0];
    const nomeDoc = nomeDocInput.value.trim();
    const recado  = recadoInput.value.trim();
    const tipo    = tipoDropdown.value;

    if (!arquivo || !nomeDoc || !tipo) {
      alert('Preencha nome, tipo e selecione um arquivo!');
      return;
    }

    if (!alunoId) {
      alert('Erro: aluno não identificado. Faça login novamente.');
      return;
    }

    const formData = new FormData();
    formData.append('arquivo',        arquivo);
    formData.append('nome_documento', nomeDoc);
    formData.append('recado',         recado);
    formData.append('tipo_documento', tipo);
    formData.append('aluno_id',       alunoId);

    try {
      const data = await Api.upload('/aluno/criar-documento', formData);

      if (data.status === 'sucesso') {
        alert(data.mensagem);
        nomeArquivoText.textContent = '';
        fileInput.value    = '';
        nomeDocInput.value = '';
        recadoInput.value  = '';
        tipoDropdown.value = '';
        if (typeof carregarProgresso === 'function') carregarProgresso();
      } else {
        alert(data.mensagem || 'Erro ao enviar documento.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao conectar com o servidor.');
    }
  });
});
