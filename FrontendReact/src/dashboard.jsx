import { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard({ sair, nome }) {
  const [transacoes, setTransacoes] = useState([]);

  const [resumo, setResumo] = useState({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
  });

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("receita");
  const [data, setData] = useState("");

  // null = nenhuma transação sendo editada
  const [editandoId, setEditandoId] = useState(null);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const token = localStorage.getItem("token");

  // ==========================================
  // CARREGAR TRANSAÇÕES E RESUMO
  // ==========================================

  async function carregarDados() {
    try {
      const respostaTransacoes = await fetch(
        "http://localhost:3000/transacoes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dadosTransacoes = await respostaTransacoes.json();

      if (!respostaTransacoes.ok) {
        setErro(dadosTransacoes.mensagem);
        return;
      }

      setTransacoes(dadosTransacoes);

      const respostaResumo = await fetch(
        "http://localhost:3000/transacoes/resumo",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dadosResumo = await respostaResumo.json();

      if (!respostaResumo.ok) {
        setErro(dadosResumo.mensagem);
        return;
      }

      setResumo(dadosResumo);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível conectar ao servidor.");
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  // ==========================================
  // LIMPAR FORMULÁRIO
  // ==========================================

  function limparFormulario() {
    setDescricao("");
    setValor("");
    setTipo("receita");
    setData("");
    setEditandoId(null);
  }

  // ==========================================
  // ADICIONAR OU EDITAR TRANSAÇÃO
  // ==========================================

  async function salvarTransacao(e) {
    e.preventDefault();

    setErro("");
    setMensagem("");

    if (!descricao || !valor || !data) {
      setErro("Preencha todos os campos.");
      return;
    }

    try {
      // ======================================
      // EDITANDO
      // ======================================

      if (editandoId !== null) {
        const resposta = await fetch(
          `http://localhost:3000/transacoes/${editandoId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              descricao,
              valor: Number(valor),
              tipo,
              data,
            }),
          }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
          setErro(dados.mensagem);
          return;
        }

        setMensagem("Transação atualizada com sucesso!");

        limparFormulario();
        carregarDados();

        return;
      }

      // ======================================
      // ADICIONANDO
      // ======================================

      const resposta = await fetch(
        "http://localhost:3000/transacoes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            descricao,
            valor: Number(valor),
            tipo,
            data,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.mensagem);
        return;
      }

      setMensagem(dados.mensagem);

      limparFormulario();
      carregarDados();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível conectar ao servidor.");
    }
  }

  // ==========================================
  // COMEÇAR EDIÇÃO
  // ==========================================

  function iniciarEdicao(transacao) {
    setEditandoId(transacao.id);
    setDescricao(transacao.descricao);
    setValor(transacao.valor);
    setTipo(transacao.tipo);
    setData(transacao.data);

    setErro("");
    setMensagem("");
  }

  // ==========================================
  // EXCLUIR TRANSAÇÃO
  // ==========================================

  async function excluirTransacao(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta transação?"
    );

    if (!confirmar) {
      return;
    }

    try {
      const resposta = await fetch(
        `http://localhost:3000/transacoes/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.mensagem);
        return;
      }

      setMensagem(dados.mensagem);

      carregarDados();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível conectar ao servidor.");
    }
  }

  // ==========================================
  // FORMATAÇÃO
  // ==========================================

  function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(data) {
    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;
  }

  // ==========================================
  // TELA
  // ==========================================

  return (
    <div className="dashboard">

      <header className="dashboard-header">
        <div>
          <h1>Meu Financeiro</h1>
          <p>Painel financeiro</p>
        </div>

        <div className="usuario-header">
          <span>Olá, {nome}</span>
        

         <button onClick={sair}>
          Sair
         </button>
        </div>
      </header>

      <main>

        {/* ================================
            RESUMO
        ================================= */}

        <section className="resumo">

          <div className="card-resumo">
            <h3>Saldo</h3>

            <strong>
              {formatarMoeda(resumo.saldo)}
            </strong>
          </div>

          <div className="card-resumo">
            <h3>Receitas</h3>

            <strong>
              {formatarMoeda(resumo.totalReceitas)}
            </strong>
          </div>

          <div className="card-resumo">
            <h3>Despesas</h3>

            <strong>
              {formatarMoeda(resumo.totalDespesas)}
            </strong>
          </div>

        </section>

        {/* ================================
            FORMULÁRIO
        ================================= */}

        <section className="nova-transacao">

          <h2>
            {editandoId !== null
              ? "Editar transação"
              : "Nova transação"}
          </h2>

          {erro && (
            <div className="erro">
              {erro}
            </div>
          )}

          {mensagem && (
            <div className="sucesso">
              {mensagem}
            </div>
          )}

          <form onSubmit={salvarTransacao}>

            <div className="campo">

              <label>Descrição</label>

              <input
                type="text"
                placeholder="Ex: Mercado"
                value={descricao}
                onChange={(e) =>
                  setDescricao(e.target.value)
                }
              />

            </div>

            <div className="campo">

              <label>Valor</label>

              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={valor}
                onChange={(e) =>
                  setValor(e.target.value)
                }
              />

            </div>

            <div className="campo">

              <label>Tipo</label>

              <select
                value={tipo}
                onChange={(e) =>
                  setTipo(e.target.value)
                }
              >

                <option value="receita">
                  Receita
                </option>

                <option value="despesa">
                  Despesa
                </option>

              </select>

            </div>

            <div className="campo">

              <label>Data</label>

              <input
                type="date"
                value={data}
                onChange={(e) =>
                  setData(e.target.value)
                }
              />

            </div>

            <button type="submit">
              {editandoId !== null
                ? "Salvar alterações"
                : "Adicionar transação"}
            </button>

            {editandoId !== null && (
              <button
                type="button"
                onClick={limparFormulario}
              >
                Cancelar edição
              </button>
            )}

          </form>

        </section>

        {/* ================================
            LISTA DE TRANSAÇÕES
        ================================= */}

        <section className="lista-transacoes">

          <h2>Transações</h2>

          {transacoes.length === 0 ? (
            <p>
              Nenhuma transação cadastrada.
            </p>
          ) : (

            <div className="tabela-container">

              <table>

                <thead>

                  <tr>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Tipo</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>

                </thead>

                <tbody>

                  {transacoes.map((transacao) => (

                    <tr key={transacao.id}>

                      <td>
                        {transacao.descricao}
                      </td>

                      <td>
                        {formatarMoeda(transacao.valor)}
                      </td>

                      <td>
                        {transacao.tipo.charAt(0).toUpperCase()+transacao.tipo.slice(1)}
                      </td>

                      <td>
                        {formatarData(transacao.data)}
                      </td>

                      <td>

                        <button
                          type="button"
                          onClick={() =>
                            iniciarEdicao(transacao)
                          }
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            excluirTransacao(
                              transacao.id
                            )
                          }
                        >
                          Excluir
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default Dashboard;