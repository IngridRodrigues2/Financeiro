

Sistema web para controle de finanças pessoais, desenvolvido como um projeto Full Stack.

A aplicação permite que usuários gerenciem suas receitas e despesas, acompanhem seu saldo e mantenham um histórico de suas movimentações financeiras de forma simples e organizada.

---

## Sobre o projeto

O **Meu Financeiro** foi desenvolvido com o objetivo de criar uma aplicação completa de controle financeiro, envolvendo desde a interface do usuário até uma API REST e um banco de dados relacional.

O projeto possui autenticação de usuários e operações de CRUD para gerenciamento de transações financeiras.

### Fluxo da aplicação

```text
React + Vite
     ↓
API REST
     ↓
Node.js + Express
     ↓
PostgreSQL
     ↓
Supabase
## Rotas principais

# Usuários

```text
POST /cadastro
POST /login
```

# Transações

```text
GET    /transacoes
POST   /transacoes
PUT    /transacoes/:id
DELETE /transacoes/:id
```

As rotas de transações são protegidas por autenticação.

# Objetivo do projeto

O objetivo do projeto é demonstrar conhecimentos fundamentais de desenvolvimento Full Stack, incluindo:

* Desenvolvimento de interfaces web
* Consumo de APIs
* Desenvolvimento de API REST
* Autenticação de usuários
* Criptografia de senhas
* Persistência em banco de dados
* Operações CRUD
* Integração entre front-end, back-end e banco de dados

Desenvolvido por **Ingrid Rodrigues** como projeto prático de desenvolvimento Full Stack.
