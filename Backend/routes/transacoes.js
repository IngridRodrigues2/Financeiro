const express = require("express");
const db= require("../database/database");
const autenticar=require("../middleware/authMiddleware");

const router= express.Router();
router.post("/",autenticar,(req,res)=>{
    const { descricao, valor, tipo, data }=req.body;
    if(!descricao||!valor||!tipo||!data){
        return res.status(400).json({
            mensagem:"Todos os campos são obrigatorios."
        });
    }
    if(valor<=0){
        return res.status(400).json({
            mensagem:"O valor deve ser maior que zero."
        });
    }
    if(tipo !== "Receita" && tipo !== "Despesa"){
        return res.status(400).json({
            mensagem:"O tipo deve ser Receita ou Respesa."
        });
    }
    db.run(
        `INSERT INTO transacoes (descricao,valor,tipo, data,usuario_id) VALUES(?,?,?,?,?)`,
        [descricao, valor, tipo, data, req.usuarioId],
        function(err){
            if(err){
                console.error("Erro ao criar transição",err.message);
                return res.status(500).json({
                    mensagem:"Erro ao criar transição."
                });
            }
            res.status(201).json({
                mensagem:"Transição criada com sucesso!",transacaoId:this.lastID
            });
        }
    )
});
router.get("/",autenticar,(req,res)=>{
    db.all(`SELECT * FROM transacoes WHERE usuario_id=?`,
        [req.usuarioId],
        (err, transacoes)=>{
            if(err){
                console.error("Erro ao buscar transaçoes:",err.message);
                return res.status(500).json({
                    mensagem:"Erro ao buscar transações."
                });
            }
            res.json(transacoes);
        }
    );
});

router.put("/:id", autenticar, (req,res)=>{
    const { descricao, valor, tipo, data }= req.body;
    const id=req.params.id;
    if( !descricao || !valor || !tipo || !data){
        return res.status(400).json({
            mensagem:"Todos os campos são obrigatórios."
        });
    }
    if(valor<=0){
        return res.status(400).json({
            mensagem:"o valor deve ser maior que zero."
        });
    }
    if(tipo!=="receita" && tipo!=="despesa"){
        return res.status(400).json({
            mensagem:"O tipo deve ser despesa ou receita."
        });
    }
    db.run(`UPDATE transacoes SET descricao = ? ,
        VALOR=?,TIPO=?,DATA=?
        WHERE id=? AND usuario_id=?`,
        [descricao ,valor,tipo,data,id,req.usuarioId],
        function(err){
            if(err){
                console.error("Erro ao atualizar a transição.",err.message);
                return res.status(500).json({
                    mensagem:"Erro ao atualizar a transição."
                });
            }
            if(this.changes === 0){
                return res.status(404).json({
                    mensagem:"Transição não encontrada."
                });
            }
            res.json({
                mensagem:"Transição atualizada com sucesso!."
            });
        }
    );
});
router.delete("/:id",autenticar,(req,res)=>{
    const id=req.params.id;
    db.run(
        `DELETE FROM transacoes WHERE id= ? AND usuario_id=?`,
        [id,req.usuarioId],
        function(err){
            if(err){
                console.error("Erro ao excluir transação:",err.message);
                return res.status(404).json({
                    mensagem:"Erro ao exluir transação."
                });
            }
            if(this.changes === 0){
                return res.status(404).json({
                    mensagem:"Transação não encontrada."
                });
            }
            res.json({
                mensagem:"Transação excluida com sucesso!"
            });
        }
    );
});
router.get("/resumo",autenticar,(req,res)=>{
    db.get(
        `SELECT COALESCE(SUM(CASE WHEN tipo='receita' THEN valor ELSE 0
        END),0) AS totalReceitas, COALESCE(SUM(CASE WHEN tipo='despesa'THEN valor ELSE 0
        END),0) AS totalDespesas
        FROM transacoes
        WHERE usuario_id=?`,
        [req.usuarioId],(err, resultado)=>{
            if(err){
                console.error("Erro ao buscar resumo:",err.message);
                return res.status(500).json({
                    mensagem:"Erro ao calcular resumo."
                });
            }
            const saldo=resultado.totalReceitas-resultado.totalDespesas;

            res.json({
                totalReceitas:resultado.totalReceitas,
                totalDespesas:resultado.totalDespesas,
                saldo: saldo
            });
        }
    );
});
module.exports=router;