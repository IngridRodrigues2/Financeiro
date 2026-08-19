const express= require("express");
const bcrypt=require("bcrypt");
const jwt= require("jsonwebtoken");

const router=express.Router();
const db= require("../database/database");

router.post("/register",async(req,res)=>{
    const{ nome,email,senha } = req.body;
    if(!nome|| !email|| !senha){
        return res.status(400).json({
            mensagem: "Nome, e-mail e senha são obrigatórios."
        });
    }
    try{
        const senhaHash=await bcrypt.hash(senha,10);
        db.run(`INSERT INTO usuarios(nome, email, senha) VALUES(?,?,?)`,
            [nome,email,senhaHash], function(err){
                if(err){
                    if(err.message.includes("UNIQUE")){
                        return res.status(400).json({
                            mensagem:"Este e-mail já está cadastrado."
                        });
                    }
                    return res.status(500).json({
                        mensagem:"Erro ao cadastrar usuário."
                    });
                }
                res.status(201).json({
                    mensagem:"Usuário cadastrado com sucesso!",usuarioId: this.lastID
                });
            }
        );
    }catch(error){
        console.error("Erro no BCRYPT:",error);
        res.status(500).json({
            mensagem:"Erro ao processar a senha."
        });
    }
});

router.post("/login",(req, res)=>{
    const { email,senha }= req.body;
    if(!email||!senha){
        return res.status(400).json({
            mensagem:"E-mail e senha são obrigatórios."
        });
    }
    db.get(
        `SELECT *FROM usuarios WHERE email = ?`,[email], async(err,usuario)=>{
            if(err){
                return res.status(500).json({
                    mensagem:"Erro ao buscar usuário."
                });
            }
            if(!usuario){
                return res.status(401).json({
                    mensagem:"Email ou senha incorretos."
                });
            }
            const senhaCorreta=await bcrypt.compare(senha,usuario.senha);
            
            if(!senhaCorreta){
                return res.status(401).json({
                    mensagem:"Email ou senhas incorretos."
                });
            }
            const token=jwt.sign(
                { usuarioId:usuario.id},"chave-secreta-do-projeto",
                { expiresIn:"1h"}
            );
            res.json({
                mensagem:"Login realizado com sucesso!.",usuarioId:usuario.id,token:token
            });
        }
    );
});
module.exports=router;