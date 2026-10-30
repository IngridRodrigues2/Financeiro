import { useState } from "react";
import "./App.css";
import Dashboard from "./Dashboard";

function App() {
  const [tela, setTela] = useState("login");
  const [logado, setLogado] = useState(!!localStorage.getItem("token"));
  const [nomeUsuario, setNomeUsuario] = useState("");

  // Login
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregandoLogin, setCarregandoLogin] = useState(false);

  // Cadastro
  const [nomeCadastro, setNomeCadastro] = useState("");
  const [emailCadastro, setEmailCadastro] = useState("");
  const [senhaCadastro, setSenhaCadastro] = useState("");
  const [mensagemCadastro, setMensagemCadastro] = useState("");

  ///////recuperação////////
  const [emailRecuperacao, setEmailRecuperacao] = useState("");
  const [mensagemRecuperacao, setMensagemRecuperacao] = useState("");
  const [carregandoRecuperacao, setCarregandoRecuperacao] = useState(false);

  ////////redefinicao de senha//////////
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagemRedefinicao, setMensagemRedefinicao] = useState("");
  const [carregandoRedefinicao, setCarregandoRedefinicao] = useState(false);


  async function fazerCadastro(e) {
    e.preventDefault();

    setErro("");
    setMensagemCadastro("");

    if (!nomeCadastro || !emailCadastro || !senhaCadastro) {
      setErro("Preencha todos os campos.");
      return;
    }

    try {
      const resposta = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
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
    setCarregandoLogin(true);

    try {
      const resposta = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
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
    } finally {
      setCarregandoLogin(false);
    }
  }
  async function solicitarRecuperacao(e) {
    e.preventDefault();
    setMensagemRecuperacao("");
    setCarregandoRecuperacao(true);

    try {
      const resposta = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: emailRecuperacao }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagemRecuperacao(
          dados.mensagem || "Não foi possível solicitar a recuperação."
        );
        return;
      }

      setMensagemRecuperacao(dados.mensagem);
    } catch (error) {
      console.error(error);
      setMensagemRecuperacao("Não foi possível conectar ao servidor.");
    } finally {
      setCarregandoRecuperacao(false);
    }
  }
  async function redefinirSenha(e) {
    e.preventDefault();
    setMensagemRedefinicao("");

    if (novaSenha.length < 8) {
      setMensagemRedefinicao("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setMensagemRedefinicao("As senhas não coincidem.");
      return;
    }

    const parametros = new URLSearchParams(window.location.search);
    const token = parametros.get("token");

    if (!token) {
      setMensagemRedefinicao("Link de recuperação inválido.");
      return;
    }

    setCarregandoRedefinicao(true);

    try {
      const resposta = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            senha: novaSenha,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagemRedefinicao(
          dados.mensagem || "Não foi possível redefinir a senha."
        );
        return;
      }

      setMensagemRedefinicao("Senha redefinida com sucesso!");

      setTimeout(() => {
        window.history.replaceState({}, "", "/");
        setNovaSenha("");
        setConfirmarSenha("");
        setTela("login");
      }, 2000);

    } catch (error) {
      console.error(error);
      setMensagemRedefinicao("Não foi possível conectar ao servidor.");
    } finally {
      setCarregandoRedefinicao(false);
    }
  }
  // TELA DE REDEFINIÇÃO DE SENHA
  const parametros = new URLSearchParams(window.location.search);
  const possuiToken = parametros.has("token");

  if (possuiToken && tela === "login") {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Meu Financeiro</h1>
          <p>Redefinir senha</p>

          {mensagemRedefinicao && (
            <div className="sucesso">{mensagemRedefinicao}</div>
          )}

          <form onSubmit={redefinirSenha}>
            <div className="campo">
              <label>Nova senha</label>
              <input
                type="password"
                placeholder="Digite sua nova senha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
              />
            </div>

            <div className="campo">
              <label>Confirmar nova senha</label>
              <input
                type="password"
                placeholder="Confirme sua nova senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={carregandoRedefinicao}>
              {carregandoRedefinicao ? "Salvando..." : "Redefinir senha"}
            </button>
          </form>
        </div>
      </div>
    );
  }
  if (logado) {
    return (
      <Dashboard
        nome={nomeUsuario}
        sair={() => {
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
  // TELA DE RECUPERAÇÃO DE SENHA
  if (tela === "recuperacao") {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Meu Financeiro</h1>
          <p>Recuperar senha</p>

          {mensagemRecuperacao && (
            <div className="sucesso">{mensagemRecuperacao}</div>
          )}

          <form onSubmit={solicitarRecuperacao}>
            <div className="campo">
              <label htmlFor="emailRecuperacao">E-mail</label>
              <input
                type="email"
                id="emailRecuperacao"
                placeholder="voce@email.com"
                value={emailRecuperacao}
                onChange={(e) => setEmailRecuperacao(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={carregandoRecuperacao}>
              {carregandoRecuperacao
                ? "Enviando..."
                : "Enviar link de recuperação"}
            </button>
          </form>

          <p className="cadastro">
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

          <button type="submit" disabled={carregandoLogin}>{carregandoLogin && <span className="spinner"></span>}
            {carregandoLogin ? "Entrando..." : "Entrar"}
          </button>

        </form>
        <p className="cadastro">
          <span onClick={() => {
            setMensagemRecuperacao("");
            setEmailRecuperacao(email);
            setTela("recuperacao");
          }}>
            Esqueci minha senha
          </span>
        </p>


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