# Next Stage — Laravel 12 (Feature-Based)

Sistema de Gestão de Estágio Supervisionado para a Fatec Franco da Rocha.

---

## Instalação

```bash
# 1. Instalar dependências
composer install

# 2. Copiar .env e configurar banco
cp .env.example .env

# 3. Gerar chave da aplicação
php artisan key:generate

# 4. Configurar o .env com seus dados do banco MySQL

# 5. Rodar migrations + seeds
php artisan migrate --seed

# 6. Criar link simbólico para uploads
php artisan storage:link

# 7. Iniciar o servidor
php artisan serve
```

A API estará disponível em: `http://localhost:8000/api`

---

## Estrutura Feature-Based

```
app/
├── Features/
│   ├── Auth/
│   │   ├── Controllers/AuthController.php
│   │   ├── Services/AuthService.php
│   │   └── Requests/LoginRequest.php
│   ├── Aluno/
│   │   ├── Controllers/AlunoController.php
│   │   └── Services/AlunoService.php
│   ├── Professor/
│   │   ├── Controllers/ProfessorController.php
│   │   └── Services/ProfessorService.php
│   ├── Admin/
│   │   ├── Controllers/AdminController.php
│   │   └── Services/AdminService.php
│   ├── Secretaria/
│   │   ├── Controllers/SecretariaController.php
│   │   └── Services/SecretariaService.php
│   └── Perfil/
│       ├── Controllers/PerfilController.php
│       └── Services/PerfilService.php
├── Http/Middleware/
│   ├── VerificarToken.php
│   └── VerificarAdmin.php
└── Models/
    ├── Professor.php, Aluno.php, Secretaria.php
    ├── Curso.php, Tipo.php, Status.php
    ├── Documento.php, Validacao.php, Feedback.php
    ├── Modelo.php, PrazoAluno.php
```

---

## Mapeamento: PHP original → Laravel

| PHP original | Rota Laravel | Método |
|---|---|---|
| `confirmLogin.php` | `POST /api/login` | público |
| `logout.php` | `POST /api/logout` | público |
| `verificarToken.php` | `POST /api/verificar-token` | público |
| `infoPerfil.php` | `POST /api/perfil` | auth.token |
| `uploadFoto.php` | `POST /api/upload-foto` | auth.token |
| `aluno/getTipos.php` | `GET /api/aluno/tipos` | auth.token:aluno |
| `aluno/listarDocumentosAluno.php` | `POST /api/aluno/documentos` | auth.token:aluno |
| `aluno/createdoc.php` | `POST /api/aluno/criar-documento` | auth.token:aluno |
| `professor/listarAluno.php` | `GET /api/professor/alunos` | auth.token:professor |
| `professor/listarAlunoDetalhe.php` | `POST /api/professor/aluno/detalhe` | auth.token:professor |
| `professor/createAluno.php` | `POST /api/professor/aluno/criar` | auth.token:professor |
| `professor/cadastrarAlunos.php` | `POST /api/professor/alunos/csv` | auth.token:professor |
| `professor/concluirAluno.php` | `POST /api/professor/aluno/concluir` | auth.token:professor |
| `professor/listarDocumentos.php` | `POST /api/professor/documentos` | auth.token:professor |
| `professor/atualizarStatus.php` | `POST /api/professor/status` | auth.token:professor |
| `professor/gerenciarPrazos.php` (GET) | `GET /api/professor/prazos` | auth.token:professor |
| `professor/gerenciarPrazos.php` (POST) | `POST /api/professor/prazos` | auth.token:professor |
| `professor/listarModelos.php` | `GET /api/professor/modelos` | auth.token:professor |
| `professor/uploadModelo.php` | `POST /api/professor/modelos/upload` | auth.token:professor |
| `professor/baixarModelo.php` | `GET /api/professor/modelos/baixar` | auth.token:professor |
| `admin/gerenciarTipos.php` | `GET\|POST /api/admin/tipos` | auth.token:professor + admin |
| `admin/listarCursos.php` | `GET /api/admin/cursos` | auth.token:professor + admin |
| `admin/criarCurso.php` | `POST /api/admin/cursos` | auth.token:professor + admin |
| `admin/atualizarCurso.php` | `POST /api/admin/cursos/atualizar` | auth.token:professor + admin |
| `admin/listarProfessores.php` | `GET /api/admin/professores` | auth.token:professor + admin |
| `admin/createProfessor.php` | `POST /api/admin/professores` | auth.token:professor + admin |
| `secretaria/listarAlunosConcluidos.php` | `GET /api/secretaria/alunos-concluidos` | auth.token:secretaria |

---

## Atualização do Front-End

Substituir as URLs no `config.js`. Ao invés de apontar para `/back-end/pages/...`, apontar para `/api/...`.

### Exemplo: config.js atualizado

```javascript
(function () {
  // URL base da API Laravel
  window.API = 'http://localhost:8000/api';
  // Mantém BASE para assets estáticos (imagens, uploads)
  window.BASE = 'http://localhost:8000';
})();
```

### Exemplo: fetch atualizado (login)

```javascript
// ANTES (PHP)
fetch(BASE + '/back-end/confirmLogin.php', { ... })

// DEPOIS (Laravel)
fetch(API + '/login', { ... })
```

### Autenticação nas requisições

Após o login, enviar o token em todas as requisições protegidas:

```javascript
fetch(API + '/aluno/documentos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'X-Tipo-Usuario': localStorage.getItem('tipoUsuario'),
  },
  body: JSON.stringify({ aluno_id: alunoId }),
})
```

---

## Usuários padrão (seed)

| Tipo | Email | Senha |
|---|---|---|
| Admin | admin@admin.com | admin |
| Professor | professor@gmail.com | 123456 |
| Aluno | teste@gmail.com | teste123 |
| Secretaria | secretaria@teste.com | 123456 |

---

## Uploads

Os arquivos ficam em `storage/app/public/uploads/`.  
Após `php artisan storage:link`, ficam acessíveis em:  
`http://localhost:8000/storage/uploads/aluno_1/arquivo.pdf`
