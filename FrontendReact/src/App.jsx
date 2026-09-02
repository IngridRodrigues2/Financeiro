import { useState } from "react";
import "./App.css";
import Dashboard from "./dashboard";

function App() {
  const [tela, setTela] = useState("login");
  const [logado,setLogado]=useState(!!localStorage.getItem("token"));
  const [nomeUsuario, setNomeUsuario]=useState("");

  // Login
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  // Cadastro
  const [nomeCadastro, setNomeCadastro] = useState("");
  const [emailCadastro, setEmailCadastro] = useState("");
  const [senhaCadastro, setSenhaCadastro] = useState("");
  const [mensagemCadastro, setMensagemCadastro] = useState("");

  async function fazerCadastro(e) {
    e.preventDefault();

    setErro("");
    setMensagemCadastro("");

    if (!nomeCadastro || !emailCadastro || !senhaCadastro) {
      setErro("Preencha todos os campos.");
      return;
    }

    try {
      const resposta = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nomeCadastro,
          email: emailCadastro,
          senha: senhaCadastro,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.mensagem);
        return;
      }

      setMensagemCadastro(dados.mensagem);

      setNomeCadastro("");
      setEmailCadastro("");
      setSenhaCadastro("");

    } catch (error) {
      console.error(error);
      setErro("Não foi possível conectar ao servidor.");
    }
  }

  async function fazerLogin(e) {
  e.preventDefault();

  setErro("");

  if (!email || !senha) {
    setErro("Preencha o email e a senha.");
    return;
  }

  try {
    const resposta = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        senha: senha,
      }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      setErro(dados.mensagem);
      return;
    }

    console.log("Login realizado:", dados);

    localStorage.setItem("token", dados.token);
    localStorage.setItem("usuarioId", dados.usuarioId);

    setNomeUsuario(dados.nome);
    setLogado(true);

  } catch (error) {
    console.error(error);
    setErro("Não foi possível conectar ao servidor.");
  }
}
  if(logado){
    return (
      <Dashboard 
        nome={nomeUsuario}
        sair={()=> {
         localStorage.removeItem("token");
         localStorage.removeItem("usuarioId");
         setLogado(false);
        }}
      />
    );
  }
  // -------------------------
  // TELA DE CADASTRO
  // -------------------------

  if (tela === "cadastro") {
    return (
      <div className="login-container">
        <div className="login-card">

          <h1>Meu Financeiro</h1>

          <p>Crie sua conta</p>

          {erro && <div className="erro">{erro}</div>}

          {mensagemCadastro && (
            <div className="sucesso">
              {mensagemCadastro}
            </div>
          )}

          <form onSubmit={fazerCadastro}>

            <div className="campo">
              <label htmlFor="nome">Nome</label>

              <input
                type="text"
                id="nome"
                placeholder="Seu nome"
                value={nomeCadastro}
                onChange={(e) => setNomeCadastro(e.target.value)}
              />
            </div>

            <div className="campo">
              <label htmlFor="emailCadastro">Email</label>

              <input
                type="email"
                id="emailCadastro"
                placeholder="voce@email.com"
                value={emailCadastro}
                onChange={(e) => setEmailCadastro(e.target.value)}
              />
            </div>

            <div className="campo">
              <label htmlFor="senhaCadastro">Senha</label>

              <input
                type="password"
                id="senhaCadastro"
                placeholder="••••••••"
                value={senhaCadastro}
                onChange={(e) => setSenhaCadastro(e.target.value)}
              />
            </div>

            <button type="submit">
              Criar conta
            </button>

          </form>

          <p className="cadastro">
            Já tem uma conta?{" "}
            <span onClick={() => setTela("login")}>
              Voltar para o login
            </span>
          </p>

        </div>
      </div>
    );
  }

  // -------------------------
  // TELA DE LOGIN
  // -------------------------

  return (
    <div className="login-container">
      <div className="login-card">

        <h1>Meu Financeiro</h1>

        <p>Controle suas receitas e despesas</p>

        {erro && <div className="erro">{erro}</div>}

        <form onSubmit={fazerLogin}>

          <div className="campo">
            <label htmlFor="email">Email</label>

            <input
              type="email"
              id="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="senha">Senha</label>

            <input
              type="password"
              id="senha"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <button type="submit">
            Entrar
          </button>

        </form>

        <p className="cadastro">
          Não tem uma conta?{" "}
          <span onClick={() => setTela("cadastro")}>
            Criar cadastro
          </span>
        </p>

      </div>
    </div>
  );
}

export default App;