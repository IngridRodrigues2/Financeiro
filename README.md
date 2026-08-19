#  Meu Financeiro

Aplicação web Full Stack para controle financeiro pessoal, desenvolvida como projeto prático de desenvolvimento web.

O sistema permite que usuários criem uma conta, façam login e gerenciem suas próprias receitas e despesas.

##  Funcionalidades

* Cadastro de usuários
* Login com autenticação
* Autenticação utilizando JWT
* Proteção das rotas de transações
* Cadastro de receitas e despesas
* Listagem de transações
* Edição de transações
* Exclusão de transações
* Cálculo automático de:

  * Saldo
  * Total de receitas
  * Total de despesas
* Persistência dos dados em banco SQLite
* Interface responsiva utilizando Bootstrap

##  Tecnologias utilizadas

## Front-end

* HTML5
* CSS3
* JavaScript
* Bootstrap 5

## Back-end

* Node.js
* Express
* SQLite
* JWT
* bcrypt

##  Estrutura do projeto

```text
meu-financeiro/
├── backend/
│   ├── server.js
│   └── ...
│
├── front-end/
│   ├── cadastro.html
│   ├── cadastro.js
│   ├── dashboard.html
│   ├── dashboard.js
│   ├── login.html
│   ├── login.js
│   └── css/
│       └── style.css
│
├── .gitignore
├── package.json
└── README.md
```

##  Autenticação

O sistema utiliza autenticação baseada em JWT.

Após realizar o login, o usuário recebe um token de autenticação. Esse token é enviado nas requisições protegidas para permitir o acesso às suas transações.

Cada usuário possui acesso somente às suas próprias informações financeiras.

## Banco de dados

O projeto utiliza SQLite para persistência dos dados.

As principais informações armazenadas são:

# Usuários

* ID
* Nome
* E-mail
* Senha protegida por hash

# Transações

* ID
* Descrição
* Valor
* Tipo
* Data
* ID do usuário

##  Como executar o projeto

## 1. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
```

# 2. Entrar na pasta

```bash
cd meu-financeiro
```

# 3. Instalar as dependências

```bash
npm install
```

# 4. Iniciar o servidor

```bash
node backend/server.js
```

O servidor será iniciado em:

```text
http://localhost:3000
```

# 5. Abrir o front-end

Abra o arquivo:

```text
front-end/login.html
```

no navegador.

# Fluxo da aplicação

```text
Usuário
   ↓
Front-end
   ↓
API REST
   ↓
Node.js + Express
   ↓
SQLite
   ↓
Resposta da API
   ↓
Dashboard
```

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
