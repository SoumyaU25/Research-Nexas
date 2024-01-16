const {decodeAccessToken}=require('../login-system/token')
const mysql=require('mysql')

require("dotenv").config()
const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT

const db = mysql.createPool({
    connectionLimit: 100,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    port: DB_PORT
})

const display=async(req,res)=>{
    const decodedtoken = decodeAccessToken(req.headers.authorization);
    if (!decodedtoken || !decodedtoken.user) {
        console.error('Invalid or missing user information in the token');
        return res.status(401).send('Unauthorized');
    }
    const userid=decodedtoken.user;
    await db.getConnection(async(err,connection)=>{
        if(err) throw err;
        const sqlquery="SELECT user.*,info.* FROM user_table as user inner join info_table as info where id=?"
        const query=mysql.format(sqlquery,[userid])
        await connection.query(query,(err,result)=>{
            if(err) throw err;
            // console.log("result",result)
            const username=result[0].username
            const name=result[0].name;
            const email=result[0].email;
            const col_name=result[0].col_name;
            const state=result[0].state;
            const year=result[0].year;
            const course=result[0].course;
            // console.log(name,email,col_name,state,year,course)
            res.status(200).json({username,name,email,col_name,state,year,course});
            connection.release();
        })
    })
}

module.exports={display}