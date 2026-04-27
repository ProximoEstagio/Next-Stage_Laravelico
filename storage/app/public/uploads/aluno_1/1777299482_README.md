# Next Stage — Laravel 12 (Feature-Based)

Sistema de Gestão de Estágio Supervisionado para a Fatec Franco da Rocha.

---

## Pré-requisitos

### 1. PHP 8.4
- Baixa em https://windows.php.net/download/ → VS17 x64 Thread Safe
- Extrai para `C:\php\`
- Adiciona `C:\php\` nas variáveis de ambiente do Windows (PATH)
- Verifica: `php --version`

### 2. Composer
- Baixa o instalador em https://getcomposer.org/download/
- Durante a instalação aponta para `C:\php\php.exe`
- Verifica: `composer --version`

### 3. MySQL
- Pode usar o XAMPP (só o MySQL) ou instalar o MySQL separado
- Cria um banco vazio chamado `proximo_estagio`

---

## Instalação

```bash
# 1. Instalar dependências
composer install

# 2. Copiar .env e configurar banco
cp .env.example .env

# 3. Gerar chave da aplicação
php artisan key:generate

# 4. Configurar o .env com os dados do banco
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=proximo_estagio
# DB_USERNAME=root
# DB_PASSWORD=

# 5. Rodar migrations + seeds
php artisan migrate --seed

# 6. Criar link simbólico para uploads
php artisan storage:link

# 7. Cachear configurações (melhora a performance)
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 8. Iniciar o servidor
php artisan serve
```

Acessa: `http://127.0.0.1:8000/Front-End/index.html`

---

## Credenciais padrão (seed)

| Tipo       | Email                | Senha    |
|------------|----------------------|----------|
| Admin      | admin@admin.com      | admin    |
| Professor  | professor@gmail.com  | 123456   |
| Aluno      | teste@gmail.com      | teste123 |
| Secretaria | secretaria@teste.com | 123456   |

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

| PHP original                            | Rota Laravel                            | Método                       |
|-----------------------------------------|-----------------------------------------|------------------------------|
| `confirmLogin.php`                      | `POST /api/login`                       | público                      |
| `logout.php`                            | `POST /api/logout`                      | público                      |
| `verificarToken.php`                    | `POST /api/verificar-token`             | público                      |
| `infoPerfil.php`                        | `POST /api/perfil`                      | auth.token                   |
| `uploadFoto.php`                        | `POST /api/upload-foto`                 | auth.token                   |
| `aluno/getTipos.php`                    | `GET /api/aluno/tipos`                  | auth.token:aluno             |
| `aluno/listarDocumentosAluno.php`       | `POST /api/aluno/documentos`            | auth.token:aluno             |
| `aluno/createdoc.php`                   | `POST /api/aluno/criar-documento`       | auth.token:aluno             |
| `professor/listarAluno.php`             | `GET /api/professor/alunos`             | auth.token:professor         |
| `professor/listarAlunoDetalhe.php`      | `POST /api/professor/aluno/detalhe`     | auth.token:professor         |
| `professor/createAluno.php`             | `POST /api/professor/aluno/criar`       | auth.token:professor         |
| `professor/cadastrarAlunos.php`         | `POST /api/professor/alunos/csv`        | auth.token:professor         |
| `professor/concluirAluno.php`           | `POST /api/professor/aluno/concluir`    | auth.token:professor         |
| `professor/listarDocumentos.php`        | `POST /api/professor/documentos`        | auth.token:professor         |
| `professor/atualizarStatus.php`         | `POST /api/professor/status`            | auth.token:professor         |
| `professor/gerenciarPrazos.php` (GET)   | `GET /api/professor/prazos`             | auth.token:professor         |
| `professor/gerenciarPrazos.php` (POST)  | `POST /api/professor/prazos`            | auth.token:professor         |
| `professor/listarModelos.php`           | `GET /api/professor/modelos`            | auth.token:professor         |
| `professor/uploadModelo.php`            | `POST /api/professor/modelos/upload`    | auth.token:professor         |
| `professor/baixarModelo.php`            | `GET /api/professor/modelos/baixar`     | auth.token:professor         |
| `admin/gerenciarTipos.php`              | `GET/POST /api/admin/tipos`             | auth.token:professor + admin |
| `admin/listarCursos.php`                | `GET /api/admin/cursos`                 | auth.token:professor + admin |
| `admin/criarCurso.php`                  | `POST /api/admin/cursos`                | auth.token:professor + admin |
| `admin/atualizarCurso.php`              | `POST /api/admin/cursos/atualizar`      | auth.token:professor + admin |
| `admin/listarProfessores.php`           | `GET /api/admin/professores`            | auth.token:professor + admin |
| `admin/createProfessor.php`             | `POST /api/admin/professores`           | auth.token:professor + admin |
| `secretaria/listarAlunosConcluidos.php` | `GET /api/secretaria/alunos-concluidos` | auth.token:secretaria        |

---

## Uploads

Os arquivos ficam em `storage/app/public/uploads/`.
Após `php artisan storage:link`, ficam acessíveis em:
`http://localhost:8000/storage/uploads/aluno_1/arquivo.pdf`

---

## Observações

- Senhas dos alunos cadastrados via CSV têm como padrão o próprio RA do aluno
- O cache melhora muito a performance — rode sempre após alterações nas configurações ou rotas
- Para limpar o cache: `php artisan optimize:clear`
