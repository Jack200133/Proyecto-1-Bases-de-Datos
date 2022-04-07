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
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
  
}

const getUserByID = async (req,res)=>{
    try{
        const response = await pool.query('SELECT * FROM usuarios WHERE id = $1',[req.params.id])
        res.json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
}

const getUsersByCorreo = async (req,res)=>{
    try{
        const response = await pool.query('SELECT * FROM usuarios WHERE correo = $1',[req.params.correo])
        res.json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
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
            const secondr =  await pool.query('select * from usuarios where correo = $1', [correo])
            res.json({
                message:'Agregado el usuario',
                status: true,
                user:secondr.rows
            })
        }
        res.json({
            message:'Usuario ya existente',
            status: false,
            body:{
                user:{name,correo,suscripcion}
            }
         })
        
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
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

    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
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

    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
}

const delUser = async(req,res) =>{
    try{
        const response = await pool.query('DELETE FROM usuarios where id=$1',[req.params.id])
        res.json(`User ${req.params.id} eliminado de BD`)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
    
}

const getPelis = async (req,res) => {
    try{
        const response = await pool.query('Select * from peliculas_series')
        res.status(200).json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
    
}
const getPelisByID = async (req,res)=>{
    try{
        const response = await pool.query('SELECT * FROM peliculas_series WHERE codigo = $1',[req.params.id])
        res.json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
    
}

const getPelisByName = async (req,res)=>{
    try{
        const id = req.params.id+"%"
        console.log(id)
        const response = await pool.query('select distinct * from peliculas_series ps where lower(ps.nombre) like $1',[id])
        res.json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
    
}
const getPelisByActor = async (req,res)=>{
    try{
        const id = "%"+req.params.id+"%"
        console.log(id)
        const temp = await pool.query("select distinct ps.* from peliculas_series ps inner join actua a  on ps.codigo= a.id_contenido inner join actor a2  on a.id_actor =a2.id where  lower(concat(a2.nombre,' ',a2.apellido)) like $1" ,[id])
        res.json(temp.rows)

    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
    
}
const getPelisByGenero = async (req,res)=>{
    try{
        const id = req.params.id+"%"
        console.log(id)
        const response = await pool.query('select distinct ps.* from peliculas_series ps inner join contenido_genero cg on ps.codigo= cg.id_contenido inner join generos g on cg.id_genero =g.id_genero where lower(g.genero) like $1',[id])
        res.json(response.rows)

    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
    
}
const getPelisByDirector = async (req,res)=>{
    try{
        const id = req.params.id+"%"
        console.log(id)
        const response = await pool.query("select distinct ps.* from peliculas_series ps  inner join dirigio d on ps.codigo= d.id_contenido inner join directores d2  on d.id_director =d2.id where  lower(concat(d2.nombre,' ',d2.apellido)) like  $1",[id])
        res.json(response.rows)

    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
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
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
}
    

const getPelisByFecha = async (req,res)=>{
    try{
        const id = req.params.id+"%"
        console.log(id)
        const response = await pool.query('select distinct ps.*  from peliculas_series ps where ps.fecha_estreno >=$1',[id])
        res.json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
    
}

const getPerfilByCorreo = async(req,res)=>{
    try{
        const correo = req.params.correo
        console.log(correo)
        const response = await pool.query('select * from perfil p where id_usuario in ( select id from usuarios u where correo =$1)and activo = true;',[correo])
        console.log(response.rows)
        res.json(response.rows)

    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
    
}


const createVisto = async (req, res) => {
    try{
        const id = req.params.id
        const {idmovie} = req.body
        
        const other = await pool.query('delete from viendo where id_perfil = $1 and codigo_contenido = $2', [id, idmovie])
        const response = await pool.query('insert into Visto values($1,$2)',[id, idmovie])
        console.log(response)
        console.log(other)
        res.json('Visto created')

    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
    
}

const AnuncioVisto = async (req, res) => {
    try{
        const {contenido} = req.body
        
        const response = await pool.query('insert into reproduccion_anuncios values ($1,current_timestamp)',[contenido])
        console.log(response)
        res.json('Anuncio Insertado')

    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
    
}



const createViendo = async (req, res) => {
    try{
        const id = req.params.id
        const {idmovie} = req.body
        
        const response = await pool.query('insert into Viendo values($1,$2)',[id, idmovie])
        console.log(response)
        res.json('Viendo created')

    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
    
}
const createFav = async (req, res) => {
    try{
        const id = req.params.id
        const {idmovie} = req.body
        
        const response = await pool.query('insert into favoritos values($1,$2)',[id, idmovie])
        console.log(response)
        res.json('Favorito created')

    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
    
}

const getVistoByID = async (req,res)=>{
    try{
        const id = req.params.id
        const response = await pool.query('SELECT ps.* FROM Visto f join peliculas_series ps on ps.codigo = f.id_contenido WHERE id_perfil = $1',[id])
        res.json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
}

const getFavByID = async (req,res)=>{
    try{
        const id = req.params.id
        const response = await pool.query('SELECT ps.* FROM favoritos f join peliculas_series ps on ps.codigo = f.codigo_contenido WHERE id_perfil = $1',[id])
        res.json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
}

const getViendoByID = async (req,res)=>{
    try{
        const id = req.params.id
        const response = await pool.query('SELECT ps.* FROM Viendo f join peliculas_series ps on ps.codigo = f.codigo_contenido WHERE id_perfil = $1',[id])
        res.json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
}

const createProfile = async (req, res)=> {
    try{
        const {id_usuario, name} = req.body
        console.log(name)
        const response = await pool.query('insert into perfil(id_usuario, nombre, viendo, activo) values ($1,$2,$3,$4)',[id_usuario, name, false, true])
        console.log(response)
        res.json('Perfil created')
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
}

const updateProf = async (req, res) => {
    try{
        
        const id = req.params.id
        const sus = req.params.sus
        const num = req.params.num
        //console.log(id)
        //const {suscripcion,numerocuentas} = req.body
        console.log(id, sus, num)
        const newSus = await pool.query('UPDATE usuarios SET suscripcion = $1 WHERE id = $2',[sus,id])
        const porfil = await pool.query('select * from perfil where id_usuario =  $1 limit $2',[id,num])
        const setFalse = await pool.query('UPDATE perfil SET activo = false WHERE id_usuario =$1',[id])
        //console.log(newSus)
        for(const pepe in porfil.rows){
            const setTreu = await pool.query('UPDATE perfil SET activo = true WHERE id_perfil =$1', [porfil.rows[pepe].id_perfil])
            console.log(porfil.rows[pepe].id_perfil)
        }
        
        //const newProf = await poolquery('UPDATE perfil SET activo = true WHERE id_perfil = $1 limit $2;')
        //console.log(response)
        res.json('User Updated')

    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
    
}

const getAnuncios = async (req, res) => {
    try{
        const response = await pool.query('select * from anuncio')
        res.json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
}
const getRecomendaciones = async (req,res)=>{

        const id = req.params.id
        const getIDs = await pool.query('select * from favoritos f where id_perfil  = $1 union select * from visto where id_perfil  = $1 union select * from viendo where id_perfil  = $1',[id])
        //console.log(getIDs)
        let getGeneros = []
        for(const pepe in getIDs.rows){
            const chuiquita = await pool.query('select id_genero from peliculas_series ps join contenido_genero cg on cg.id_contenido = ps.codigo where codigo = $1', [getIDs.rows[pepe].codigo_contenido])
            getGeneros.push(chuiquita.rows)
            //console.log(getIDs.rows[pepe].codigo_contenido)
        } 
        //console.log(getGeneros)
        let final = []
        for (const okaru in getGeneros){
           for(const momo in getGeneros[okaru]){
               console.log(getGeneros[okaru][momo].id_genero)
               const dadadan = await pool.query('select distinct(ps.*) from peliculas_series ps join contenido_genero cg on cg.id_contenido = ps.codigo where cg.id_genero = $1',[getGeneros[okaru][momo].id_genero])
               for(const kirito in dadadan.rows){
                   console.log(dadadan.rows[kirito].codigo)
                   if(!final.includes(dadadan.rows[kirito])){
                        final.push(dadadan.rows[kirito])
                   }   
               }
              
           }
        }
       
        res.json(final)
    
}


const updateViendo = async (req, res) => {

    const id = req.params.id
    const viendo = req.params.viendo
    const request = await pool.query('UPDATE perfil SET viendo = $1 WHERE id_perfil = $2',[viendo,id])
    res.json('Profile Updated')

}
/*  UPDATE usuarios SET suscripcion = $1 WHERE id = $2 ;
    UPDATE perfil SET activo = true WHERE id_perfil = $1; */

module.exports = {
    getUsers,
    createUser,
    getUserByID,
    getUsersByCorreo,
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
    getPerfilByCorreo,
    createVisto,
    createViendo,
    createFav,
    getFavByID,
    getViendoByID,
    getVistoByID,
    createProfile,
    updateProf,
    getAnuncios,
    getRecomendaciones,
    updateViendo,
    AnuncioVisto
}