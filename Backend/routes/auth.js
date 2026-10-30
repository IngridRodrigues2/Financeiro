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
    const crypto = require("crypto");
    const { Resend } = require("resend");

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Solicitar recuperação de senha
    router.post("/forgot-password", async (req, res) => {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                mensagem: "Informe seu e-mail."
            });
        }

        try {
            const resultado = await db.query(
                "SELECT id FROM usuarios WHERE email = $1",
                [email.trim().toLowerCase()]
            );

            // Não revelar se o e-mail está cadastrado
            if (resultado.rows.length === 0) {
                return res.json({
                    mensagem: "Se o e-mail estiver cadastrado, você receberá as instruções."
                });
            }

            const usuarioId = resultado.rows[0].id;
            const token = crypto.randomBytes(32).toString("hex");
            const tokenHash = crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");

            await db.query(
                `UPDATE recuperacao_senha
             SET usado = TRUE
             WHERE usuario_id = $1 AND usado = FALSE`,
                [usuarioId]
            );

            await db.query(
                `INSERT INTO recuperacao_senha
             (usuario_id, token_hash, expira_em)
             VALUES ($1, $2, NOW() + INTERVAL '30 minutes')`,
                [usuarioId, tokenHash]
            );

            const link =
                `${process.env.FRONTEND_URL}/redefinir-senha?token=${token}`;

            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL,
                to: [email.trim().toLowerCase()],
                subject: "Recuperação de senha - Meu Financeiro",
                html: `
                <h2>Recuperação de senha</h2>
                <p>Você solicitou a redefinição da senha do Meu Financeiro.</p>
                <p><a href="${link}">Clique aqui para criar uma nova senha</a></p>
                <p>O link expira em 30 minutos. Se você não fez essa solicitação, ignore este e-mail.</p>
            `
            });

            return res.json({
                mensagem: "Se o e-mail estiver cadastrado, você receberá as instruções."
            });
        } catch (error) {
            console.error("Erro ao solicitar recuperação:", error);
            return res.status(500).json({
                mensagem: "Não foi possível solicitar a recuperação agora."
            });
        }
    });

    // Redefinir senha
    router.post("/reset-password", async (req, res) => {
        const { token, senha } = req.body;

        if (!token || !senha || senha.length < 8) {
            return res.status(400).json({
                mensagem: "Informe o token e uma senha com pelo menos 8 caracteres."
            });
        }

        try {
            const tokenHash = crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");

            const resultado = await db.query(
                `SELECT id, usuario_id
             FROM recuperacao_senha
             WHERE token_hash = $1
               AND usado = FALSE
               AND expira_em > NOW()`,
                [tokenHash]
            );

            if (resultado.rows.length === 0) {
                return res.status(400).json({
                    mensagem: "Link inválido ou expirado."
                });
            }

            const recuperacao = resultado.rows[0];
            const senhaHash = await bcrypt.hash(senha, 10);

            await db.query(
                "UPDATE usuarios SET senha = $1 WHERE id = $2",
                [senhaHash, recuperacao.usuario_id]
            );

            await db.query(
                "UPDATE recuperacao_senha SET usado = TRUE WHERE id = $1",
                [recuperacao.id]
            );

            return res.json({
                mensagem: "Senha redefinida com sucesso!"
            });
        } catch (error) {
            console.error("Erro ao redefinir senha:", error);
            return res.status(500).json({
                mensagem: "Não foi possível redefinir a senha."
            });
        }
    });
});

module.exports = router;