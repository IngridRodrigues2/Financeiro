//Conexão com o banco///
require("dotenv").config();
const { Pool}=require("pg");

const connectionString= process.env.AMBIENTE==="local" ? process.env.DATABASE_URL_LOCAL: process.env.DATABASE_URL_NEON;

const pool= new Pool({
    connectionString, ssl: process.env.AMBIENTE==="local"?false:{rejectUnauthorized:false}
});

module.exports=pool;