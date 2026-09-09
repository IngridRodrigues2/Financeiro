//Conexão com o banco///
require("dotenv").config();
const { Pool}=require("pg");

const pool= new Pool({
    connectionString:process.env.DATABASE_URL
});


//*tabela de usuarios//

//tabela transiçoes//


module.exports=pool;