require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();
const db = require("../database/database");

router.post("/register", async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({
            mensagem: "Nome, e-mail e senha são obrigatórios."
        });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        const resultado = await db.query(
            `INSERT INTO usuarios(nome, email, senha)
             VALUES($1, $2, $3)
             RETURNING id`,
            [nome, email, senhaHash]
        );

        res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso!",
            usuarioId: resultado.rows[0].id
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(400).json({
                mensagem: "Este e-mail já está cadastrado."
            });
        }

        console.error("Erro ao cadastrar usuário:", error);

        res.status(500).json({
            mensagem: "Erro ao cadastrar usuário."
        });
    }
});

router.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            mensagem: "E-mail e senha são obrigatórios."
        });
    }

    try {
        const resultado = await db.query(
            `SELECT * FROM usuarios WHERE email = $1`,
            [email]
        );

        const usuario = resultado.rows[0];

        if (!usuario) {
            return res.status(401).json({
                mensagem: "Email ou senha incorretos."
            });
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({
                mensagem: "Email ou senha incorretos."
            });
        }

        const token = jwt.sign(
            { usuarioId: usuario.id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            mensagem: "Login realizado com sucesso!",
            usuarioId: usuario.id,
            nome: usuario.nome,
            token: token
        });

    } catch (error) {
        console.error("Erro ao fazer login:", error);

        res.status(500).json({
            mensagem: "Erro ao fazer login."
        });
    }
});

module.exports = router;