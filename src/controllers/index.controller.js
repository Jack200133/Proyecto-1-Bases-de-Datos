const {Pool} = require('pg')
const bcrypt = require('bcryptjs')
const { json } = require('express')


const pool = new Pool ({
    host: 'localhost',
    user: 'postgres',
    password: 'LittleRose2021',
    database: 'pruebasapi',
    port: '5432'
})

const getUsers = async (req,res) => {
   const response = await pool.query('Select * from users')
   res.status(200).json(response.rows)
}

const getUserByID = async (req,res)=>{
    const response = await pool.query('SELECT * FROM users WHERE id = $1',[req.params.id])
    res.json(response.rows)
}

const createUser = async(req,res)=>{
    const {name,pass} = req.body
    //const id = 'DEFAULT'
    const rondas = 10
    const haspass = await bcrypt.hash(pass, rondas);

    const response = await pool.query('insert into users(name,pass) values($1,$2)',[name,haspass])
    console.log(response)
    res.json({
         message:'Agregado el usuario',
         body:{
             user:{name,haspass}
         }
    })
}

const updateUser = async (req, res) => {
    const id = req.params.id
    const { name, pass } = req.body
    const rondas = 10
    const haspass = await bcrypt.hash(pass, rondas);
    console.log(id, name, pass)
    const response = await pool.query('Update users SET name = $1, pass = $2 WHERE id =$3',[
        name,
        haspass,
        id
    ])
    console.log(response)
    res.json('User Updated')
};

const delUser = async(req,res) =>{
    const response = await pool.query('DELETE FROM users where id=$1',[req.params.id])
    
    res.json(`User ${req.params.id} eliminado de BD`)
}


module.exports = {
    getUsers,
    createUser,
    getUserByID,
    delUser,
    updateUser
}