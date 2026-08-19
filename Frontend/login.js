document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("formLogin");
  const erroBox = document.getElementById("loginErro");

  const API_URL = "http://localhost:3000";

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!email || !senha) {
      mostrarErro("Preencha email e senha para entrar.");
      return;
    }

    try {

      const resposta = await fetch(`${API_URL}/auth/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email: email,
          senha: senha
        })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        mostrarErro(
          dados.mensagem || "E-mail ou senha incorretos."
        );
        return;
      }

      // Salva o usuário retornado pela API
      const usuarioLogado = {
        id: dados.usuarioId,
        nome: dados.nome,
        email:email
      };

      localStorage.setItem(
        "mf_usuario_logado",
        JSON.stringify(usuarioLogado)
      );

      // Salva o JWT
      localStorage.setItem(
        "mf_token",
        dados.token
      );

      // Vai para o dashboard
      window.location.href = "dashboard.html";

    } catch (erro) {

      console.error("Erro ao fazer login:", erro);

      mostrarErro(
        "Não foi possível conectar ao servidor."
      );
    }
  });

  function mostrarErro(msg) {
    erroBox.textContent = msg;
    erroBox.classList.remove("d-none");
  }

});
