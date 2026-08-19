const jwt = require("jsonwebtoken");

function autenticar(req,res,next){
    const autorizacao= req.headers.authorization;
    if(!autorizacao){
        return res.status(401).json({
            mensagem:"Token não informado."
        });
    }
    const partes=autorizacao.split(" ");
    if(partes.length !==2||partes[0] !== "Bearer"){
        return res.status(401).json({
            mensagem:"Formato do token Inválido."
        });
    }
    const token=partes[1];
    try{
        const dados=jwt.verify(token,"chave-secreta-do-projeto");
        req.usuarioId=dados.usuarioId;

        next();
    }catch(error){
        return res.status(401).json({
            mensagem:"Token inválido ou expirado."
        });
    }
}
module.exports=autenticar;