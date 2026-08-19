// cadastro.js - lógica exclusiva da página cadastro.html

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formCadastro");
  const erroBox = document.getElementById("cadastroErro");
  const sucessoBox = document.getElementById("cadastroSucesso");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    esconderMensagens();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const confirmarSenha = document.getElementById("confirmarSenha").value.trim();

    if (!nome || !email || !senha || !confirmarSenha) {
      mostrarErro("Preencha todos os campos.");
      return;
    }

    if (senha !== confirmarSenha) {
      mostrarErro("As senhas não coincidem.");
      return;
    }

    // Fictício: em produção, aqui entraria a chamada para a API de cadastro.
    const usuarios = JSON.parse(localStorage.getItem("mf_usuarios") || "[]");

    if (usuarios.some((u) => u.email === email)) {
      mostrarErro("Já existe uma conta com esse email.");
      return;
    }

    usuarios.push({ nome, email, senha });
    localStorage.setItem("mf_usuarios", JSON.stringify(usuarios));

    mostrarSucesso("Conta criada com sucesso! Redirecionando para o login...");
    setTimeout(function () {
      window.location.href = "login.html";
    }, 1200);
  });

  function mostrarErro(msg) {
    erroBox.textContent = msg;
    erroBox.classList.remove("d-none");
  }

  function mostrarSucesso(msg) {
    sucessoBox.textContent = msg;
    sucessoBox.classList.remove("d-none");
  }

  function esconderMensagens() {
    erroBox.classList.add("d-none");
    sucessoBox.classList.add("d-none");
  }
});
