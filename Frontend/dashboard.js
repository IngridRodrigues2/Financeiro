// dashboard.js - lógica da página dashboard.html

document.addEventListener("DOMContentLoaded", async function () {

  const API_URL = "http://localhost:3000";

  // ---- Proteção de acesso ----
  const usuarioLogado = JSON.parse(
    localStorage.getItem("mf_usuario_logado") || "null"
  );

  const token = localStorage.getItem("mf_token");

  if (!usuarioLogado || !token) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("nomeUsuario").textContent =
    usuarioLogado.nome;

  // ---- Botão Sair ----
  document.getElementById("btnSair").addEventListener("click", function () {
    localStorage.removeItem("mf_usuario_logado");
    localStorage.removeItem("mf_token");

    window.location.href = "login.html";
  });

  // ---- Headers da API ----
  function headersJSON() {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  }

  // ---- Formatação ----
  function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function formatarData(dataISO) {
    if (!dataISO) return "";

    const data = dataISO.substring(0, 10);
    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;
  }

  // ---- Carregar transações do backend ----
  async function carregarTransacoes() {

    try {

      const resposta = await fetch(
        `${API_URL}/transacoes`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem || "Erro ao buscar transações."
        );
      }

      renderizar(dados);

    } catch (erro) {

      console.error("Erro ao buscar transações:", erro);

      document.getElementById("tabelaTransacoes").innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-danger py-4">
            Erro ao carregar transações.
          </td>
        </tr>
      `;
    }
  }

  // ---- Renderizar tabela e resumo ----
  function renderizar(transacoes) {

    const receitas = transacoes
      .filter(t => t.tipo === "Receita")
      .reduce((total, t) => total + Number(t.valor), 0);

    const despesas = transacoes
      .filter(t => t.tipo === "Despesa")
      .reduce((total, t) => total + Number(t.valor), 0);

    const saldo = receitas - despesas;

    document.getElementById("valorSaldo").textContent =
      formatarMoeda(saldo);

    document.getElementById("valorReceitas").textContent =
      formatarMoeda(receitas);

    document.getElementById("valorDespesas").textContent =
      formatarMoeda(despesas);

    const corpoTabela =
      document.getElementById("tabelaTransacoes");

    corpoTabela.innerHTML = "";

    if (transacoes.length === 0) {

      corpoTabela.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted py-4">
            Nenhuma transação cadastrada.
          </td>
        </tr>
      `;

      return;
    }

    transacoes
      .slice()
      .sort((a, b) =>
        a.data < b.data ? 1 : -1
      )
      .forEach(t => {

        const badge =
          t.tipo === "Receita"
            ? "text-bg-success"
            : "text-bg-danger";

        const corValor =
          t.tipo === "Receita"
            ? "text-success"
            : "text-danger";

        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${t.descricao}</td>

          <td class="${corValor} fw-semibold">
            ${formatarMoeda(t.valor)}
          </td>

          <td>
            <span class="badge ${badge}">
              ${t.tipo}
            </span>
          </td>

          <td class="d-none d-md-table-cell">
            ${formatarData(t.data)}
          </td>

          <td>
            <button
              class="btn btn-sm btn-outline-primary btn-editar"
              data-id="${t.id}">
              Editar
            </button>

            <button
              class="btn btn-sm btn-outline-danger btn-excluir"
              data-id="${t.id}">
              Excluir
            </button>
          </td>
        `;

        corpoTabela.appendChild(tr);
      });
  }

  // ---- Modal Nova Transação ----
  const formNovaTransacao =
    document.getElementById("formNovaTransacao");

  const modalEl =
    document.getElementById("modalNovaTransacao");

  const modalBootstrap =
    new bootstrap.Modal(modalEl);

  modalEl.addEventListener("show.bs.modal", function () {

    formNovaTransacao.reset();

    document.getElementById("data").valueAsDate =
      new Date();
  });

  // ---- Criar transação ----
  formNovaTransacao.addEventListener(
    "submit",
    async function (e) {

      e.preventDefault();

      const descricao =
        document.getElementById("descricao").value.trim();

      const valor =
        parseFloat(
          document.getElementById("valor").value
        );

      const tipo =
        document.getElementById("tipo").value;

      const data =
        document.getElementById("data").value;

      if (!descricao || !valor || !data) {
        alert("Preencha todos os campos.");
        return;
      }

      try {

        const resposta = await fetch(
          `${API_URL}/transacoes`,
          {
            method: "POST",
            headers: headersJSON(),

            body: JSON.stringify({
              descricao: descricao,
              valor: valor,
              tipo: tipo,
              data: data
            })
          }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            dados.mensagem ||
            "Erro ao criar transação."
          );
        }

        alert(
          dados.mensagem ||
          "Transação criada com sucesso!"
        );

        modalBootstrap.hide();

        await carregarTransacoes();

      } catch (erro) {

        console.error(
          "Erro ao criar transação:",
          erro
        );

        alert(erro.message);
      }
    }
  );

  // ---- Excluir transação ----
  document.addEventListener(
    "click",
    async function (e) {

      if (
        !e.target.classList.contains("btn-excluir")
      ) {
        return;
      }

      const id = e.target.dataset.id;

      const confirmar = confirm(
        "Tem certeza que deseja excluir esta transação?"
      );

      if (!confirmar) return;

      try {

        const resposta = await fetch(
          `${API_URL}/transacoes/${id}`,
          {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            dados.mensagem ||
            "Erro ao excluir transação."
          );
        }

        alert(
          dados.mensagem ||
          "Transação excluída com sucesso!"
        );

        await carregarTransacoes();

      } catch (erro) {

        console.error(
          "Erro ao excluir:",
          erro
        );

        alert(erro.message);
      }
    }
  );

  // ---- Editar transação ----
  document.addEventListener(
    "click",
    async function (e) {

      if (
        !e.target.classList.contains("btn-editar")
      ) {
        return;
      }

      const id = e.target.dataset.id;

      const descricao =
        prompt("Nova descrição:");

      if (descricao === null) return;

      const valorTexto =
        prompt("Novo valor:");

      if (valorTexto === null) return;

      const valor =
        parseFloat(valorTexto.replace(",", "."));

      if (isNaN(valor) || valor <= 0) {
        alert("Informe um valor válido.");
        return;
      }

      const tipo =
        prompt(
          "Tipo da transação (Receita ou Despesa):"
        );

      if (tipo === null) return;

      if (
        tipo !== "receita" &&
        tipo !== "despesa"
      ) {
        alert(
          "O tipo deve ser Receita ou Despesa."
        );
        return;
      }

      const data =
        prompt(
          "Data da transação (AAAA-MM-DD):"
        );

      if (data === null) return;

      try {

        const resposta = await fetch(
          `${API_URL}/transacoes/${id}`,
          {
            method: "PUT",
            headers: headersJSON(),

            body: JSON.stringify({
              descricao: descricao.trim(),
              valor: valor,
              tipo: tipo,
              data: data
            })
          }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            dados.mensagem ||
            "Erro ao atualizar transação."
          );
        }

        alert(
          dados.mensagem ||
          "Transação atualizada com sucesso!"
        );

        await carregarTransacoes();

      } catch (erro) {

        console.error(
          "Erro ao atualizar:",
          erro
        );

        alert(erro.message);
      }
    }
  );

  // ---- Carregar dashboard ----
  await carregarTransacoes();

});

