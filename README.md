# Sistema de Gestão Agropecuária

> Projeto desenvolvido para a disciplina de Engenharia de Software na Universidade Federal do Agreste de Pernambuco (UFAPE).

---

## 👥 Equipe
* **Emanuel Bezerra** - [GitHub](https://github.com/emanuelbzsantos)
* **Pedro Arthur** - [GitHub](https://github.com/PedroArthur1)
* **Thiago Mauricio** - [GitHub](https://github.com/teagomorrice)
* **Miguel Antônio** - [GitHub](https://github.com/miguel-an34)
* **Misael Marques** - - [GitHub](https://github.com/misaelmarques)

---

## 📌 Sobre o Projeto
Sistema Agropecuário de animais voltado para o cuidado, manejo, vacinação e alimentação do rebanho. Auxiliando o agricultor na sua fazenda.

---

## 🛠️ Tecnologias Utilizadas
* **Frontend:** Angular 17+ (TypeScript, HTML5, CSS3)
* **Backend:** Java 17+ com Spring Boot, Spring Security e JWT
* **Gestão e Versionamento:** Git, GitHub Organizations e GitHub Projects (Scrum)

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
- **CORS Configurado:** Permissão para requisições vindas da aplicação Angular (`http://localhost:4200`).

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
* **Node.js** (versão LTS recomendada)
* **Angular CLI** (`npm install -g @angular/cli`)
* **Java JDK** (versão 17 ou superior)
* **IDE** de sua preferência (VS Code, IntelliJ, Eclipse, etc.)

---

### 1. Executando o Frontend (Angular)

```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências (se necessário)
npm install

# Inicie o servidor de desenvolvimento
ng serve
