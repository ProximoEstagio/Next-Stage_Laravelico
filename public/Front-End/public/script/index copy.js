
document.addEventListener('DOMContentLoaded', function () {
  const conteudo = document.getElementById('container');

  const login = `

    <p class="fs28">Faça seu Login</p>
    
    <div class="cl g16">
      <input type="email" id="email" placeholder="Email" required>
      <input type="password" id="senha" placeholder="Senha" required>
    </div>
    
    <div class="rw jc-sb">
      <a href="#recuperar_senha">Esqueci minha senha</a>
      <button id="login" class="btn-V w28c">Logar</button>
    </div>

    `;

  const recuperarSenha = `

    <div>
      <p class="fs28">Recuperar Conta</p>
      <p>Digite o e-mail associado à sua conta e enviaremos um código de verificação para que você possa redefinir sua senha com segurança.</p>
    </div>
    
    <input type="email" id="email" placeholder="Email" required>
    
    <div class="cl al-fe">
      <a href="#acesso" class="w28c"><button class="btn-V">Enviar</button></a>
    </div>    

    `;

  const acesso = `

    <div>
      <p class="fs28">Alterar Senha</p>
    </div>
    
    <div class="cl g16">
      <input type="email" id="email" placeholder="Email" required>
      <input type="number" id="codigo" placeholder="Código" required>
      <input type="password" id="newPassword" placeholder="Nova Senha" required>
      <input type="password" id="confirmPassword" placeholder="Confirmar Senha" required>
    </div>
    
    <div class="cl al-fe">
      <button class="btn-V w28c">Entrar</button>
    </div>

    `;

  function pageload() {
    const page = window.location.hash || '#login';

    switch (page) {
      case '#login':
        conteudo.innerHTML = login;
        break;
      case '#recuperar_senha':
        conteudo.innerHTML = recuperarSenha;
        break;
      case '#acesso':
        conteudo.innerHTML = acesso;
        break;
      default:
        conteudo.innerHTML = '<p class="fs28">404</p><p>Página não encontrada.</p>';
    }
  }

  window.addEventListener('hashchange', pageload);

  pageload();
});