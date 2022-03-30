const {Pool} = require('pg')
const bcrypt = require('bcryptjs')


const pool = new Pool ({
    host: 'proyecto-streaming.ciklfidbfwxb.us-east-1.rds.amazonaws.com',
    user: 'postgres',
    password: 'raspberry',
    database: 'proyectoStreaming',
    port: '5432'
})

const getUsers = async (req,res) => {
   const response = await pool.query('Select * from usuarios')
   res.status(200).json(response.rows)
}

const getUserByID = async (req,res)=>{
    const response = await pool.query('SELECT * FROM usuarios WHERE id = $1',[req.params.id])
    res.json(response.rows)
}

const createUser = async(req,res)=>{
    const {correo,name,pass,suscripcion} = req.body
    //const id = 'DEFAULT'
    const rondas = 10
    const haspass = await bcrypt.hash(pass, rondas);

    const response = await pool.query('insert into usuarios(correo,nombre,contraseña,estado,suscripcion) values($1,$2,$3,$4,$5)',[correo,name,haspass,false,suscripcion])
    console.log(response)
    res.json({
         message:'Agregado el usuario',
         body:{
             user:{name,correo,suscripcion}
         }
    })
}

const updateUser = async (req, res) => {
    const id = req.params.id
    const {correo,name,pass,estado,suscripcion} = req.body
    const rondas = 10
    const haspass = await bcrypt.hash(pass, rondas);
    console.log(id, name, pass)
    const response = await pool.query('Update usuarios SET correo = $1, nombre = $2, contraseña = $3,estado = $4,suscripcion =$5 WHERE id =$6',[
        correo,
        name,
        haspass,
        estado,
        suscripcion,
        id
    ])
    console.log(response)
    res.json('User Updated')
}

const passwordCheck = async (req,res) =>{
    const id = req.params.id
    const { name, pass } = req.body
    const response = await pool.query('SELECT * FROM usuarios WHERE id = $1',[id])
    const hashed = response.rows[0].contraseña
    const prn = await bcrypt.compare(pass,hashed)
    if(prn){
        res.json("Prueba completada")
    }else{
        res.json("Prueba incompleta")
    }
    
}

const delUser = async(req,res) =>{
    const response = await pool.query('DELETE FROM usuarios where id=$1',[req.params.id])
    res.json(`User ${req.params.id} eliminado de BD`)
}

const getPelis = async (req,res) => {
    const response = await pool.query('Select * from peliculas_series')
    res.status(200).json(response.rows)
}
const getPelisByID = async (req,res)=>{
    const response = await pool.query('SELECT * FROM peliculas_series WHERE codigo = $1',[req.params.id])
    res.json(response.rows)
}

const getPelisByName = async (req,res)=>{
    const id = req.params.id+"%"
    console.log(id)
    const response = await pool.query('select distinct * from peliculas_series ps where lower(ps.nombre) like $1',[id])
    res.json(response.rows)
}
const getPelisByActor = async (req,res)=>{
    const id = "%"+req.params.id+"%"
    console.log(id)
    const temp = await pool.query("select distinct ps.* from peliculas_series ps inner join actua a  on ps.codigo= a.id_contenido inner join actor a2  on a.id_actor =a2.id where  lower(concat(a2.nombre,' ',a2.apellido)) like $1" ,[id])
    res.json(temp.rows)
}
const getPelisByGenero = async (req,res)=>{
    const id = req.params.id+"%"
    console.log(id)
    const response = await pool.query('select distinct ps.* from peliculas_series ps inner join contenido_genero cg on ps.codigo= cg.id_contenido inner join generos g on cg.id_genero =g.id_genero where lower(g.genero) like $1',[id])
    res.json(response.rows)
}
const getPelisByDirector = async (req,res)=>{
    const id = req.params.id+"%"
    console.log(id)
    const response = await pool.query("select distinct ps.* from peliculas_series ps  inner join dirigio d on ps.codigo= d.id_contenido inner join directores d2  on d.id_director =d2.id where  lower(concat(d2.nombre,' ',d2.apellido)) like  $1",[id])
    res.json(response.rows)
}
const getPelisByPremio = async (req,res)=>{
    const id = req.params.id+"%"
    console.log(id)
    const response = await pool.query("select distinct ps.* from peliculas_series ps inner join gano g on ps.codigo= g.id_contenido  inner join premios p on g.id_premio =p.id where lower(p.nombre) like $1",[id])
    res.json(response.rows)
}
const getPelisByCategoria = async (req,res)=>{
    const id = req.params.id+"%"
    console.log(id)
    const response = await pool.query('select * from peliculas_series ps where lower(categoria) like $1',[id])
    res.json(response.rows)
}

const getPelisByFecha = async (req,res)=>{
    const id = req.params.id+"%"
    console.log(id)
    const response = await pool.query('select distinct ps.*  from peliculas_series ps where ps.fecha_estreno >=$1',[id])
    res.json(response.rows)
}
module.exports = {
    getUsers,
    createUser,
    getUserByID,
    delUser,
    updateUser,
    getPelis,
    getPelisByID,
    passwordCheck,
    getPelisByName,
    getPelisByActor,
    getPelisByGenero,
    getPelisByDirector,
    getPelisByPremio,
    getPelisByCategoria,
    getPelisByFecha
}