const express = require("express");
const cors = require("cors");
const db=require("./database/database");
const authRoutes=require("./routes/auth");
const transacoesRoutes=require("./routes/transacoes");
const app= express();

app.use(cors());
app.use(express.json());
app.use("/auth",authRoutes);
app.use("/transacoes",transacoesRoutes);

app.get("/teste",(req,res)=> { 
    res.send({ 
        mensagem:"API FUNCIONANDO!!"
    });
});
const PORT=3000;
 app.listen(PORT ,()=>{
    console.log(`servidor rodando em http://localhost:${PORT}/teste`);
 })