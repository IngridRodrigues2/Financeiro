//Conexão com o banco///
const sqlite3=
require("sqlite3").verbose();

const db= new sqlite3.Database("./database/financeiro.db",(err)=>{
    if(err){
        console.error("Erro ao conectar ao banco:",err.message);
    } else{
        console.log("Banco de dados conectado!");
    }
});


//*tabela de usuarios//
db.run(`CREATE TABLE IF NOT EXISTS usuarios(
    id INTEGER PRIMARY KEY AUTOINCREMENT ,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL
    )`, (err)=>{
        if(err){
            console.error("Erro ao criar tabela",err.message);
        }else{
            console.log("Tabela de usuários criada!");
        }
    });
//tabela transiçoes//

db.run(`CREATE TABLE IF NOT EXISTS transacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    descricao TEXT NOT NULL,
    valor REAL NOT NULL,
    tipo TEXT NOT NULL,
    data TEXT NOT NULL,
    usuario_id INTEGER NOT NULL,
    FOREIGN KEY (usuario_id)REFERENCES usuarios(id))`,
    (err)=>{
        if(err){
            console.error("Erro ao criar tabela de transicoes",err.message);
        }else{
            console.log("Tabela de transacoes criada!");
        }
    });
module.exports=db;