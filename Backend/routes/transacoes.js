const express = require("express");
const db = require("../database/database");
const autenticar = require("../middleware/authMiddleware");

const router = express.Router();

// Criar transação
router.post("/", autenticar, async (req, res) => {
    const { descricao, valor, tipo, data } = req.body;

    if (!descricao || !valor || !tipo || !data) {
        return res.status(400).json({
            mensagem: "Todos os campos são obrigatórios."
        });
    }

    if (valor <= 0) {
        return res.status(400).json({
            mensagem: "O valor deve ser maior que zero."
        });
    }

    if (tipo !== "receita" && tipo !== "despesa") {
        return res.status(400).json({
            mensagem: "O tipo deve ser Receita ou Despesa."
        });
    }

    try {
        const resultado = await db.query(
            `INSERT INTO transacoes
            (descricao, valor, tipo, data, usuario_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id`,
            [descricao, valor, tipo, data, req.usuarioId]
        );

        res.status(201).json({
            mensagem: "Transação criada com sucesso!",
            transacaoId: resultado.rows[0].id
        });

    } catch (error) {
        console.error("Erro ao criar transação:", error);

        res.status(500).json({
            mensagem: "Erro ao criar transação."
        });
    }
});

// Listar transações
router.get("/", autenticar, async (req, res) => {
    try {
        const resultado = await db.query(
            `SELECT * FROM transacoes
             WHERE usuario_id = $1
             ORDER BY id DESC`,
            [req.usuarioId]
        );

        res.json(resultado.rows);

    } catch (error) {
        console.error("Erro ao buscar transações:", error);

        res.status(500).json({
            mensagem: "Erro ao buscar transações."
        });
    }
});

// Editar transação
router.put("/:id", autenticar, async (req, res) => {
    const { descricao, valor, tipo, data } = req.body;
    const id = req.params.id;

    if (!descricao || !valor || !tipo || !data) {
        return res.status(400).json({
            mensagem: "Todos os campos são obrigatórios."
        });
    }

    if (valor <= 0) {
        return res.status(400).json({
            mensagem: "O valor deve ser maior que zero."
        });
    }

    if (tipo !== "receita" && tipo !== "despesa") {
        return res.status(400).json({
            mensagem: "O tipo deve ser despesa ou receita."
        });
    }

    try {
        const resultado = await db.query(
            `UPDATE transacoes
             SET descricao = $1,
                 valor = $2,
                 tipo = $3,
                 data = $4
             WHERE id = $5
             AND usuario_id = $6`,
            [descricao, valor, tipo, data, id, req.usuarioId]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                mensagem: "Transação não encontrada."
            });
        }

        res.json({
            mensagem: "Transação atualizada com sucesso!"
        });

    } catch (error) {
        console.error("Erro ao atualizar a transação:", error);

        res.status(500).json({
            mensagem: "Erro ao atualizar a transação."
        });
    }
});

// Excluir transação
router.delete("/:id", autenticar, async (req, res) => {
    const id = req.params.id;

    try {
        const resultado = await db.query(
            `DELETE FROM transacoes
             WHERE id = $1
             AND usuario_id = $2`,
            [id, req.usuarioId]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                mensagem: "Transação não encontrada."
            });
        }

        res.json({
            mensagem: "Transação excluída com sucesso!"
        });

    } catch (error) {
        console.error("Erro ao excluir transação:", error);

        res.status(500).json({
            mensagem: "Erro ao excluir transação."
        });
    }
});

// Resumo financeiro
router.get("/resumo", autenticar, async (req, res) => {
    try {
        const resultado = await db.query(
            `SELECT
                COALESCE(
                    SUM(CASE
                        WHEN tipo = 'receita' THEN valor
                        ELSE 0
                    END), 0
                ) AS "totalReceitas",

                COALESCE(
                    SUM(CASE
                        WHEN tipo = 'despesa' THEN valor
                        ELSE 0
                    END), 0
                ) AS "totalDespesas"

             FROM transacoes
             WHERE usuario_id = $1`,
            [req.usuarioId]
        );

        const totalReceitas = Number(resultado.rows[0].totalReceitas);
        const totalDespesas = Number(resultado.rows[0].totalDespesas);
        const saldo = totalReceitas - totalDespesas;

        res.json({
            totalReceitas,
            totalDespesas,
            saldo
        });

    } catch (error) {
        console.error("Erro ao buscar resumo:", error);

        res.status(500).json({
            mensagem: "Erro ao calcular resumo."
        });
    }
});

module.exports = router;