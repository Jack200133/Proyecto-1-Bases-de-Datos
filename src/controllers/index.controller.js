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
    try{
        const response = await pool.query('Select * from usuarios')
        res.status(200).json(response.rows)
    }catch{

    }
  
}

const getUserByID = async (req,res)=>{
    try{
        const response = await pool.query('SELECT * FROM usuarios WHERE id = $1',[req.params.id])
        res.json(response.rows)
    }catch{

    }
}

const createUser = async(req,res)=>{

    try{
        const {correo,name,pass,suscripcion} = req.body
        //const id = 'DEFAULT'
        const rondas = 10
        const haspass = await bcrypt.hash(pass, rondas);

        const prof = await pool.query('SELECT * FROM usuarios WHERE correo = $1',[correo])
        console.log(prof)
        if(prof.rowCount ===0){
            const response = await pool.query('insert into usuarios(correo,nombre,contraseña,estado,suscripcion) values($1,$2,$3,$4,$5)',[correo,name,haspass,false,suscripcion])
            console.log(response)
            res.json({
                message:'Agregado el usuario',
                status: true,
                body:{
                    user:{name,correo,suscripcion}
                }
            })
        }
        res.json({
            message:'Usuario ya existente',
            status: false,
            body:{
                user:{name,correo,suscripcion}
            }
         })
        
    }catch{

    }
    
}

const updateUser = async (req, res) => {
    try{
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

    }catch{

    }
    
}

const passwordCheck = async (req,res) =>{
    try{
        const correo = req.params.correo
        const pass = req.params.pass
        console.log(pass,correo)
        const response = await pool.query('SELECT * FROM usuarios WHERE correo = $1',[correo])
        console.log(response)
        if(response.rowCount === 0){
            res.json({
                completado: false
            })
        }else{
            const hashed = response.rows[0].contraseña
            const prn = await bcrypt.compare(pass,hashed)
            if(prn){
                res.json({
                    completado: true
                })
            }else{
                res.json({
                    completado: false
                })
            }
        }

    }catch{

    }
}

const delUser = async(req,res) =>{
    try{
        const response = await pool.query('DELETE FROM usuarios where id=$1',[req.params.id])
        res.json(`User ${req.params.id} eliminado de BD`)
    }catch{

    }
    
}

const getPelis = async (req,res) => {
    try{
        const response = await pool.query('Select * from peliculas_series')
        res.status(200).json(response.rows)
    }catch{

    }
    
}
const getPelisByID = async (req,res)=>{
    try{
        const response = await pool.query('SELECT * FROM peliculas_series WHERE codigo = $1',[req.params.id])
        res.json(response.rows)
    }catch{

    }
    
}

const getPelisByName = async (req,res)=>{
    try{
        const id = req.params.id+"%"
        console.log(id)
        const response = await pool.query('select distinct * from peliculas_series ps where lower(ps.nombre) like $1',[id])
        res.json(response.rows)
    }catch{

    }
    
}
const getPelisByActor = async (req,res)=>{
    try{
        const id = "%"+req.params.id+"%"
        console.log(id)
        const temp = await pool.query("select distinct ps.* from peliculas_series ps inner join actua a  on ps.codigo= a.id_contenido inner join actor a2  on a.id_actor =a2.id where  lower(concat(a2.nombre,' ',a2.apellido)) like $1" ,[id])
        res.json(temp.rows)

    }catch{

    }
    
}
const getPelisByGenero = async (req,res)=>{
    try{
        const id = req.params.id+"%"
        console.log(id)
        const response = await pool.query('select distinct ps.* from peliculas_series ps inner join contenido_genero cg on ps.codigo= cg.id_contenido inner join generos g on cg.id_genero =g.id_genero where lower(g.genero) like $1',[id])
        res.json(response.rows)

    }catch{

    }
    
}
const getPelisByDirector = async (req,res)=>{
    try{
        const id = req.params.id+"%"
        console.log(id)
        const response = await pool.query("select distinct ps.* from peliculas_series ps  inner join dirigio d on ps.codigo= d.id_contenido inner join directores d2  on d.id_director =d2.id where  lower(concat(d2.nombre,' ',d2.apellido)) like  $1",[id])
        res.json(response.rows)

    }catch{

    }
    
}
const getPelisByPremio = async (req,res)=>{
    try{
        const id = req.params.id+"%"
        console.log(id)
        const response = await pool.query("select distinct ps.* from peliculas_series ps inner join gano g on ps.codigo= g.id_contenido  inner join premios p on g.id_premio =p.id where lower(p.nombre) like $1",[id])
        res.json(response.rows)
    }catch{
        
    }
}
const getPelisByCategoria = async (req,res)=>{
    try{
        const id = req.params.id+"%"
        console.log(id)
        const response = await pool.query('select * from peliculas_series ps where lower(categoria) like $1',[id])
        res.json(response.rows)
    }catch{

    }
}
    

const getPelisByFecha = async (req,res)=>{
    try{
        const id = req.params.id+"%"
        console.log(id)
        const response = await pool.query('select distinct ps.*  from peliculas_series ps where ps.fecha_estreno >=$1',[id])
        res.json(response.rows)
    }catch{

    }
    
}

const getUsersByCorreo = async(req,res)=>{
    try{
        const correo = req.params.correo
        console.log(correo)
        const response = await pool.query('select * from perfil p where id_usuario in ( select id from usuarios u where correo =$1);',[correo])
        console.log(response.rows)
        res.json(response.rows)

    }catch{

    }
    
}


const createVisto = async (req, res) => {
    try{
        const id = req.params.id
        const {idmovie} = req.body
        
        const response = await pool.query('insert into Visto values($1,$2)',[id, idmovie])
        console.log(response)
        res.json('Visto created')

    }catch{

    }
    
}

const createViendo = async (req, res) => {
    try{
        const id = req.params.id
        const {idmovie} = req.body
        
        const response = await pool.query('insert into Viendo values($1,$2)',[id, idmovie])
        console.log(response)
        res.json('Viendo created')

    }catch{

    }
    
}
const createFav = async (req, res) => {
    try{
        const id = req.params.id
        const {idmovie} = req.body
        
        const response = await pool.query('insert into favoritos values($1,$2)',[id, idmovie])
        console.log(response)
        res.json('Favorito created')

    }catch{

    }
    
}

const getVistoByID = async (req,res)=>{
    try{
        const id = req.params.id
        const response = await pool.query('SELECT ps.* FROM Visto f join peliculas_series ps on ps.codigo = f.id_contenido WHERE id_perfil = $1',[id])
        res.json(response.rows)
    }catch{

    }
}

const getFavByID = async (req,res)=>{
    try{
        const id = req.params.id
        const response = await pool.query('SELECT ps.* FROM favoritos f join peliculas_series ps on ps.codigo = f.codigo_contenido WHERE id_perfil = $1',[id])
        res.json(response.rows)
    }catch{

    }
}

const getViendoByID = async (req,res)=>{
    try{
        const id = req.params.id
        const response = await pool.query('SELECT ps.* FROM Viendo f join peliculas_series ps on ps.codigo = f.codigo_contenido WHERE id_perfil = $1',[id])
        res.json(response.rows)
    }catch{

    }
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
    getPelisByFecha,
    getUsersByCorreo,
    createVisto,
    createViendo,
    createFav,
    getFavByID,
    getViendoByID,
    getVistoByID
}