# Sistema de Gestão Agropecuária

> Projeto desenvolvido para a disciplina de Engenharia de Software na Universidade Federal do Agreste de Pernambuco (UFAPE).

---

## 👥 Equipe
* **Emanuel Bezerra** - [GitHub](https://github.com/emanuelbzsantos)
* **Pedro Arthur** - [GitHub](https://github.com/PedroArthur1)
* **Thiago Mauricio** - [GitHub](https://github.com/teagomorrice)
* **Miguel Antônio** - [GitHub](https://github.com/miguel-an34)
* **Misael Marques** - [GitHub](https://github.com/misaelmarques)

---

## 📌 Sobre o Projeto
Sistema Agropecuário de animais voltado para o cuidado, manejo, vacinação e alimentação do rebanho. Auxiliando o agricultor na sua fazenda.

---

## 🛠️ Tecnologias Utilizadas
* **Frontend:** Angular 17+ (TypeScript, HTML5, CSS3, Nginx, Docker)
* **Backend:** Java 17+ com Spring Boot, Spring Security, JWT, PostgreSQL e Docker
* **Deploy & Cloud:** Render (Docker Web Services + PostgreSQL)
* **Gestão e Versionamento:** Git, GitHub Organizations e GitHub Projects (Scrum)

---

## 🌐 Deploy em Produção (Render)
* **Frontend (Aplicação Web):** [https://sistema-agropecuaria-web.onrender.com](https://sistema-agropecuaria-web.onrender.com)
* **Backend (API REST):** [https://sistema-agropecuaria-api.onrender.com](https://sistema-agropecuaria-api.onrender.com)

---

## 🔒 Funcionalidades

### Frontend (Angular)
- **Páginas de Autenticação:** Login (`/login`) e Registro de Usuários (`/register`) com formulários estilizados via CSS.
- **Gerenciamento de Sessão (`AuthService`):** Integração com a API para login/registro e armazenamento seguro do Token JWT e Roles (`ADMIN` / `USER`) no `localStorage`.
- **Injeção de Token (`HTTP Interceptor`):** Interceptador que anexa automaticamente o cabeçalho `Authorization: Bearer <token>` em todas as requisições enviadas ao backend.
- **Proteção de Rotas (`AuthGuard`):** Bloqueio de navegação para usuários não autenticados ou sem o perfil de acesso (`Role`) necessário.

### Backend (Spring Boot)
- **Spring Security & JWT:** Configuração de segurança para autenticação via token Bearer.
- **Controle de Autorização:** Restrição de endpoints por perfis de acesso (`ADMIN` e `USER`).
- **Filtro de Interceptação (`OncePerRequestFilter`):** Validação de tokens JWT recebidos em cada requisição.
- **CORS Configurado:** Permissão para requisições vindas do frontend (`http://localhost:4200` em dev e URL do Render em produção).

---

## ⚙️ Variáveis de Ambiente (Render - Backend)

| Variável | Descrição |
|----------|-----------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `JWT_SECRET` | Chave secreta do JWT (gerada no Render) |
| `FRONTEND_URL` | URL do frontend (ex.: `https://sistema-agropecuaria-web.onrender.com`) |
| `DB_HOST` | Host do PostgreSQL (vinculado ao banco Render) |
| `DB_PORT` | Porta do PostgreSQL (geralmente `5432`) |
| `DB_NAME` | Nome do banco |
| `DB_USER` | Usuário do banco |
| `DB_PASS` | Senha do banco |

No dashboard Render (serviço API), com **Root Directory = `backend`**:
- **Dockerfile Path** = `./Dockerfile` (não `backend/Dockerfile`)
- **Docker Build Context Directory** = `.`

Vincule o Postgres do Render às variáveis `DB_*` (Environment → Link Database / valores do Internal Database).

O arquivo [`render.yaml`](render.yaml) na raiz do repositório descreve backend, frontend e PostgreSQL para deploy no Render.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
* **Docker** e **Docker Compose**
* **Node.js** (versão LTS recomendada)
* **Angular CLI** (`npm install -g @angular/cli`)
* **Java JDK** (versão 17 ou superior)
* **IDE** de sua preferência (VS Code, IntelliJ, Eclipse, etc.)

---

### 1. Executando com Docker (Local)

#### Subindo o Banco de Dados (PostgreSQL)
Na raiz do projeto, execute:
```bash
docker compose up -d
```
> O PostgreSQL será iniciado na porta **5433** (mapeada para a porta 5432 interna do contêiner).

#### Executando o Backend via Docker
```bash
# Entre na pasta do backend
cd backend

# Construa a imagem
docker build -t agrogestao-backend .

# Execute o contêiner conectando ao PostgreSQL do Docker Compose
docker run -d -p 8080:8080 \
  --name agrogestao-backend \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5433 \
  -e DB_NAME=agrogestao \
  -e DB_USER=agrogestao \
  -e DB_PASS=senha123 \
  -e JWT_SECRET=chave-secreta-local \
  -e FRONTEND_URL=http://localhost:4200 \
  agrogestao-backend
```
A API estará acessível em `http://localhost:8080`.

#### Executando o Frontend via Docker
```bash
# Entre na pasta do frontend
cd frontend

# Construa a imagem
docker build -t agrogestao-frontend --build-arg API_URL=http://localhost:8080 .

# Execute o contêiner
docker run -d -p 80:80 --name agrogestao-frontend agrogestao-frontend
```
Acesse em: `http://localhost:80` (ou `http://localhost`).

---

### 2. Executando Localmente (Sem Docker)

#### Backend (Spring Boot)
```bash
# Entre na pasta do backend
cd backend

# Execute a aplicação (utiliza banco H2 em memória por padrão)
./mvnw spring-boot:run

# No Windows:
.\mvnw.cmd spring-boot:run
```
A API estará acessível em `http://localhost:8080`.

#### Frontend (Angular)
```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências (se necessário)
npm install

# Inicie o servidor de desenvolvimento
ng serve
```
Acesse em: `http://localhost:4200`.