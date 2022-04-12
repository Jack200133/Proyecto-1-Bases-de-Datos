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
        const response = await pool.query('Select * from usuarios order by id')
        res.status(200).json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error',
            error: e
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
        console.log(correo,name,haspass,false,suscripcion)
        if(prof.rowCount ===0){
            const response = await pool.query('insert into usuarios(correo,nombre,contraseña,estado,suscripcion) values($1,$2,$3,$4,$5)',[correo,name,haspass,false,suscripcion])
            console.log(response.rows)
            const secondr =  await pool.query('select * from usuarios where correo = $1', [correo])
            const tercer =  await pool.query('insert into inscripcion values ($1,$2,current_date)', [secondr.rows[0].id,suscripcion])
            return res.json({
                message:'Agregado el usuario',
                status: true,
                user:secondr.rows
            })
        }
        return res.json({
            message:'Anunciante NO existente',
            status: false,
            body:{
                user:{name,correo,suscripcion}
            }
         })
        
    }catch (e){
        console.log("ERROR")

        res.status(400).json({
            message:'Error',
            e:'e'
        })
    }
    
}

const createPelis = async (req, res) => {
    try{
        const {nombre, categoria, fecha_estreno, duracion, link, imagen} = req.body

        const prof = await pool.query('SELECT * FROM peliculas_series WHERE nombre = $1',[nombre])
        
        console.log(nombre, categoria, fecha_estreno, duracion, link, imagen)
        console.log(prof.rows)
         
        if(prof.rowCount ===0){
            const response = await pool.query('insert into peliculas_series(nombre,categoria,fecha_estreno,duracion,link,imagen) values($1,$2,$3,$4,$5,$6)',
            [nombre, 
            categoria,
            fecha_estreno,
            duracion,
            link,
            imagen])
            console.log(response)
            const secondr =  await pool.query('select * from peliculas_series where nombre = $1', [nombre])
            return res.json({
                message:'Agregada la pelicula',
                status: true,
                user:secondr.rows
            })
        }
        return res.json({
            message:'Pelicula ya existente',
            status: false,
            body:{
                user:{nombre, categoria, fecha_estreno, duracion, link, imagen}
            }
         })
        
    }catch (e){
        console.log("ERROR")

        res.status(400).json({
            message:'Error',
            e:e
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
        const banned = await pool.query('SELECT * FROM usuarios WHERE correo = $1 and activo = true',[correo])
        console.log(response,banned)
        if(response.rowCount === 0){
            return res.json({
                completado: false,
                ban: false
            })
        }else{
            const hashed = response.rows[0].contraseña
            const prn = await bcrypt.compare(pass,hashed)
            if(prn){
                return res.json({
                    completado: true,
                    ban: false
                })
            }else{
                if(banned.rowCount ===0){
                    const id = await pool.query('SELECT id FROM usuarios WHERE correo = $1',[correo])
                    const insert = await pool.query('INSERT INTO intentos_fallidos VALUES($1, current_timestamp)', [id.rows[0].id])
                    console.log(id.rows[0].id)
                    return res.json({
                        completado: false,
                        ban: false
                    })
                }
                return res.json({
                    completado: true,
                    ban: true
                })
                
            }
        }

    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error',
            completado: false,
            ban: true
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
        const response = await pool.query('Select * from peliculas_series order by codigo  asc')
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
        const response = await pool.query('select distinct * from peliculas_series ps where lower(ps.nombre) ilike $1',[id])
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
        const temp = await pool.query("select distinct ps.* from peliculas_series ps inner join actua a  on ps.codigo= a.id_contenido inner join actor a2  on a.id_actor =a2.id where  lower(concat(a2.nombre,' ',a2.apellido)) ilike $1" ,[id])
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
        const response = await pool.query('select distinct ps.* from peliculas_series ps inner join contenido_genero cg on ps.codigo= cg.id_contenido inner join generos g on cg.id_genero =g.id_genero where lower(g.genero) ilike $1',[id])
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
        const response = await pool.query("select distinct ps.* from peliculas_series ps  inner join dirigio d on ps.codigo= d.id_contenido inner join directores d2  on d.id_director =d2.id where  lower(concat(d2.nombre,' ',d2.apellido)) ilike  $1",[id])
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
        const response = await pool.query("select distinct ps.* from peliculas_series ps inner join gano g on ps.codigo= g.id_contenido  inner join premios p on g.id_premio =p.id where lower(p.nombre) ilike $1",[id])
        res.json(response.rows)
    }catch{
        
    }
}
const getPelisByCategoria = async (req,res)=>{
    try{
        const id = req.params.id+"%"
        console.log(id)
        const response = await pool.query('select * from peliculas_series ps where lower(categoria) ilike $1',[id])
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
        const {idmovie,sus} = req.body

        const other = await pool.query('delete from viendo where id_perfil = $1 and codigo_contenido = $2', [id, idmovie])
        const response = await pool.query('insert into Visto values($1,$2, current_timestamp,$3)',[id, idmovie,sus])
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
        const {idmovie,sus} = req.body
        console.log("Entre a viendo",idmovie,sus,id)
        const existe = await pool.query('select * from Viendo where codigo_contenido = $1 and id_perfil = $2', [idmovie,id])
        console.log(existe.rows)

        if(existe.rowCount === 0){
            const response = await pool.query('insert into Viendo values($1,$2, current_timestamp,$3)',[id, idmovie,sus])
            console.log(response)
            res.json('Viendo created')
        }
        

    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error',
            e:e
        })
    }
    
}
const createFav = async (req, res) => {
    try{
        const id = req.params.id
        const {idmovie,sus} = req.body
        
        const existe = await pool.query('select * from favoritos where codigo_contenido = $1',[idmovie])

        if(existe.rows.length === 0){
            const response = await pool.query('insert into favoritos values($1,$2, current_timestamp,$3)',[id, idmovie,sus])
            console.log(response)
            res.json('Favorito created')
        }

        

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
        const response = await pool.query('SELECT ps.* FROM Visto f join peliculas_series ps on ps.codigo = f.codigo_contenido WHERE id_perfil = $1',[id])
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
               const dadadan = await pool.query('select distinct(ps.*) from peliculas_series ps join contenido_genero cg on cg.id_contenido = ps.codigo where cg.id_genero = $1',[getGeneros[okaru][momo].id_genero])
               for(const kirito in dadadan.rows){
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


const createAdmin = async(req,res)=>{

    try{
        const {name,pass} = req.body
        //const id = 'DEFAULT'
        const rondas = 10
        const haspass = await bcrypt.hash(pass, rondas);
        console.log(name,haspass)
        const response = await pool.query('insert into administrador(nombre,contraseña) values($1,$2)',[name,haspass])
        console.log(response)
        res.json({
            message:'Agregado el Admin',
            status: true,
            user:{name,pass}
        })
        
        
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error',
            error:e
        })
    }
    
}

const AdminCheck = async (req,res) =>{
    try{
        const name = req.params.name
        const pass = req.params.pass
        console.log(pass,name)
        const response = await pool.query('SELECT * FROM administrador WHERE nombre = $1',[name])
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
            message:'Error',
            completado: 'Ban'
        })
    }
}

const updateAdminUser = async (req, res) => {
    try{
        console.log("COMPARTIDO")
        const id = req.params.id
        const {valor, estado,tabla} = req.body
        console.log(valor, estado,tabla,id)
        switch(tabla){
            case 'usuarios':
                console.log('Usuarios')
                switch(valor){
                    case 'nombre' :
                        const responseN = await pool.query('update usuarios set nombre = $1 where id = $2', [estado, id])
                        console.log(responseN)
                        res.json('User Updated')
                        break;
                    case 'correo' :
                        const responseC = await pool.query('update usuarios set correo = $1 where id = $2', [estado, id])
                        console.log(responseC)
                        res.json('User Updated')
                        break;
                    case 'estado' :
                        console.log(estado)
                        const est = estado ==='false'? false : true
                        console.log(est)
                        const responseE = await pool.query('update usuarios set estado = $1 where id = $2', [est, id])
                        console.log(responseE.rows)
                        res.json('User Updated')
                        break;
                    case 'suscripcion' :
                        const responseS = await pool.query('update usuarios set suscripcion = $1 where id = $2', [estado, id])
                        console.log(responseS)
                        res.json('User Updated')
                        break;
                }
                break;
            case 'peliculas_series':
                console.log('peliculas_series')
                switch(valor){
                    case 'nombre' :
                        const responseN = await pool.query('update peliculas_series set nombre = $1 where codigo = $2', [estado, id])
                        console.log(responseN)
                        res.json('Pelicula Updated')
                        break;
                    case 'categoria' :
                        const responseC = await pool.query('update peliculas_series set categoria = $1 where codigo = $2', [estado, id])
                        console.log(responseC)
                        res.json('Pelicula Updated')
                        break;
                    case 'fecha_estreno' :
                        const responseE = await pool.query('update peliculas_series set fecha_estreno = $1 where codigo = $2', [estado, id])
                        console.log(responseE)
                        res.json('Pelicula Updated')
                        break;
                    case 'duracion' :
                        console.log('duracion')
                        const responseD = await pool.query('update peliculas_series set duracion = $1 where codigo = $2', [estado, id])
                        console.log(responseD)
                        res.json('Pelicula Updated')
                        break;
                    case 'link' :
                        const responseL = await pool.query('update peliculas_series set link = $1 where codigo = $2', [estado, id])
                        console.log(responseL)
                        res.json('Pelicula Updated')
                        break;
                    case 'imagen' :
                        const responseIM = await pool.query('update peliculas_series set imagen = $1 where codigo = $2', [estado, id])
                        console.log(responseIM)
                        res.json('Pelicula Updated')
                        break;
                }
                break;
            case 'actor':
                console.log('actor')
                switch(valor){
                    case 'nombre' :
                        const responseN = await pool.query('update actor set nombre = $1 where id = $2', [estado, id])
                        console.log(responseN)
                        res.json('actor Updated')
                        break;
                    case 'apellido' :
                        const responseC = await pool.query('update actor set apellido = $1 where id = $2', [estado, id])
                        console.log(responseC)
                        res.json('actor Updated')
                        break;
                }
                break;
            case 'directores':
                console.log('directores')
                switch(valor){
                    case 'nombre' :
                        const responseN = await pool.query('update directores set nombre = $1 where id = $2', [estado, id])
                        console.log(responseN)
                        res.json('directores Updated')
                        break;
                    case 'apellido' :
                        const responseC = await pool.query('update directores set apellido = $1 where id = $2', [estado, id])
                        console.log(responseC)
                        res.json('directores Updated')
                        break;
                }
                break;
            case 'generos':
                console.log('generos')
                switch(valor){
                    case 'genero' :
                        const responseN = await pool.query('update generos set genero = $1 where id = $2', [estado, id])
                        console.log(responseN)
                        res.json('generos Updated')
                        break;
                }
                break;
            case 'premios':
                console.log('premios')
                switch(valor){
                    case 'nombre' :
                        const responseN = await pool.query('update premios set nombre = $1 where id = $2', [estado, id])
                        console.log(responseN)
                        res.json('premios Updated')
                        break;
                    case 'descripcion' :
                        const responseC = await pool.query('update premios set descripcion = $1 where id = $2', [estado, id])
                        console.log(responseC)
                        res.json('premios Updated')
                        break;
                }
                break;
            case 'anuncio':
                console.log('anuncio')
                switch(valor){
                    case 'contenido' :
                        const responseN = await pool.query('update anuncio set contenido = $1 where id = $2', [estado, id])
                        console.log(responseN)
                        res.json('anuncio Updated')
                        break;
                    case 'link' :
                        const responseC = await pool.query('update anuncio set link = $1 where id = $2', [estado, id])
                        console.log(responseC)
                        res.json('anuncio Updated')
                        break;
                }
                break;
            case 'anunciantes':
                console.log('anunciantes')
                switch(valor){
                    case 'anunciante' :
                        const responseN = await pool.query('update anunciantes set anunciante = $1 where id = $2', [estado, id])
                        console.log(responseN)
                        res.json('anunciantes Updated')
                        break;
                }
                break;
        }
        
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error',
            e:e
        })
    }

}

const deleteAdminUser = async (req, res) => {
    try{
        const id = req.params.id
        const {tabla} = req.body
        console.log(tabla,id)
        switch(tabla){
            case 'usuarios':
                const responseU = await pool.query('DELETE FROM usuarios where id=$1',[req.params.id])
                res.json(`User ${req.params.id} eliminado de BD`)
                break;
            case 'peliculas_series':
                const responseP = await pool.query('DELETE FROM peliculas_series where codigo=$1',[req.params.id])
                res.json(`Pelicula ${req.params.id} eliminado de BD`)
                break;
            case 'anuncios':
                const responseAN = await pool.query('DELETE FROM anuncio where contenido=$1',[req.params.id])
                res.json(`User ${req.params.id} eliminado de BD`)
                break;
            case 'anunciantes':
                const responseAT = await pool.query('DELETE FROM anunciantes where id=$1',[req.params.id])
                res.json(`Pelicula ${req.params.id} eliminado de BD`)
                break;
            case 'actor':
                const responseAC = await pool.query('DELETE FROM actor where id=$1',[req.params.id])
                res.json(`Actor ${req.params.id} eliminado de BD`)
                break;
            case 'directores':
                const responseDT = await pool.query('DELETE FROM directores where id=$1',[req.params.id])
                res.json(`Director ${req.params.id} eliminado de BD`)
                break;
            case 'generos':
                const responsGEN = await pool.query('DELETE FROM generos where id_genero=$1',[req.params.id])
                res.json(`User ${req.params.id} eliminado de BD`)
                break;
            case 'premios':
                const responsePE = await pool.query('DELETE FROM premios where id=$1',[req.params.id])
                res.json(`Pelicula ${req.params.id} eliminado de BD`)
                break;
            
        }
        
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error',
            e:e
        })
    }

}

const getAnuncio = async (req,res) => {
    try{
        const response = await pool.query('Select * from Anuncio order by id_anunciante')
        res.status(200).json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error',
            error: e
        })
    }
  
}

const getAnunciante = async (req,res) => {
    try{
        const response = await pool.query('Select * from anunciantes order by id')
        res.status(200).json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error',
            error: e
        })
    }
  
}

const createAnunciante = async (req,res) => {
    try{
        const {anunciante} = req.body
        console.log(anunciante)
        const response = await pool.query('insert into anunciantes(anunciante) values ($1)',[anunciante])
        console.log(response)
        res.json('Anunciante created')
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error'
        })
    }
}

const createAnuncio = async (req,res) => {
    try{

        const {anunciante, contenido, link} = req.body
        
        const getID = await pool.query('select id from anunciantes a  where anunciante = $1',[anunciante])
        console.log(getID.rowCount)
        
        const id = getID.rows[0].id
        console.log(anunciante,contenido,link,id)
        const response = await pool.query('insert into anuncio(id_anunciante, contenido, link) values ($1, $2, $3)',[id, contenido, link])
        console.log(response)
        res.json('Anuncio created')
        
    
        
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error',
            e:e
        })
    }
}

const getReporte1 = async (req,res) => {
    try{
        const {fec1,fec2} = req.body
        console.log(fec1,fec2)
        const response = await pool.query('select g.genero, sum(ps.duracion) as tiempo_visto  from peliculas_series ps inner join contenido_genero cg on ps.codigo= cg.id_contenido inner join generos g on cg.id_genero =g.id_genero inner join visto v on v.codigo_contenido =ps.codigo where fechavisto <=$1 and fechavisto>= $2 group by g.genero order by tiempo_visto desc  limit 10',[fec2,fec1])
        res.status(202).json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error',
            error: e
        })
    }
  
}

const getReporte2 = async (req,res) => {
    try{
        const {fec1,fec2} = req.body
        console.log(fec1,fec2)
        const response = await pool.query('select ps.categoria, v.subviendo, sum(ps.duracion) as tiempo_visto  from peliculas_series ps inner join visto v on v.codigo_contenido =ps.codigo where fechavisto <=$1 and fechavisto>=$2 group by ps.categoria ,v.subviendo order by categoria,subviendo',[fec2,fec1])
        res.status(202).json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error',
            error: e
        })
    }
  
}
const getReporteD = async (req,res) => {
    try{
        const gty = 'Gratis'
        const response = await pool.query('select d2.nombre,d2.apellido, count(*) as conteo  from peliculas_series ps inner join dirigio d on ps.codigo= d.id_contenido inner join directores d2  on d.id_director  =d2.id inner join visto v on v.codigo_contenido =ps.codigo where subviendo !=$1 group by d2.nombre,d2.apellido  order by count(*)desc  limit 10;',[gty])
        res.status(202).json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error',
            error: e
        })
    }
  
}
const getReporteA = async (req,res) => {
    try{
        const gty = 'Gratis'
        const response = await pool.query('select a2.nombre,a2.apellido, count(*)as conteo from peliculas_series ps inner join actua a  on ps.codigo= a.id_contenido inner join actor a2  on a.id_actor =a2.id inner join visto v on v.codigo_contenido =ps.codigo where subviendo !=$1 group by a2.nombre,a2.apellido  order by count(*)desc  limit 10;',[gty])
        res.status(202).json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error',
            error: e
        })
    }
  
}

const getReporte4 = async (req,res) => {
    try{
        const response = await pool.query("select suscripcion, count(*) as cuentas from inscripcion i where suscripcion = 'Avanzada' and fecha_inscripcion >= current_date -interval '6 months' group by suscripcion")
        res.status(202).json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error',
            error: e
        })
    }
  
}

const getReporte5 = async (req,res) => {
    try{
        const {fec} = req.body
        console.log(fec)
        const response = await pool.query('select extract (hour from fechavinedo)as horatime , count(*) as visualizaciones  from (select * from viendo v union select * from visto order by fechavinedo) as vistas where extract(year from fechavinedo) = extract( year from cast($1 as date)) and extract(month  from fechavinedo) = extract( month  from cast($1 as date)) and extract(day from fechavinedo) = extract( day from cast($1 as date)) group by horatime order by visualizaciones desc limit 1;',[fec])
        res.status(202).json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error',
            error: e
        })
    }
  
}


const getActores = async (req,res) => {
    try{
        const response = await pool.query('Select * from actor order by id')
        res.status(200).json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error',
            error: e
        })
    }
  
}

const getDirector = async (req,res) => {
    try{
        const response = await pool.query('Select * from directores order by id')
        res.status(200).json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error',
            error: e
        })
    }
  
}

const getGenero = async (req,res) => {
    try{
        const response = await pool.query('Select * from generos order by id_genero')
        res.status(200).json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error',
            error: e
        })
    }
  
}
const getPremio = async (req,res) => {
    try{
        const response = await pool.query('Select * from premios order by id')
        res.status(200).json(response.rows)
    }catch (e){
        console.log("ERROR")

        res.json({
            message:'Error',
            error: e
        })
    }
  
}

const createActores = async (req, res) => {
    try{
        const {nombre, apellido} = req.body

        const prof = await pool.query('SELECT * FROM actor WHERE nombre = $1 and apellido =$2',[nombre,apellido])
        
        console.log(nombre, apellido)
        console.log(prof.rows)
         
        if(prof.rowCount ===0){
            const response = await pool.query('insert into actor(nombre,apellido) values($1,$2)',[nombre,apellido])
            
            console.log(response)
            const secondr =  await pool.query('select * from actor where nombre = $1 and apellido =$2', [nombre,apellido])
            return res.json({
                message:'Agregada el actor',
                status: true,
                user:secondr.rows
            })
        }
        res.json({
            message:'Actor ya existente',
            status: false,
            body:{
                user:{nombre, apellido}
            }
         })
        
    }catch (e){
        console.log("ERROR",e)

        res.status(400).json({
            message:'Error',
            e:e
        })
    }

}

const createDirector = async (req, res) => {
    try{
        const {nombre, apellido} = req.body

        const prof = await pool.query('SELECT * FROM directores WHERE nombre = $1 and apellido =$2',[nombre,apellido])
        
        console.log(nombre, apellido)
        console.log(prof.rows)
         
        if(prof.rowCount ===0){
            const response = await pool.query('insert into directores(nombre,apellido) values($1,$2)',[nombre,apellido])
            
            console.log(response)
            const secondr =  await pool.query('select * from directores where nombre = $1 and apellido =$2', [nombre,apellido])
            return res.json({
                message:'Agregada el director',
                status: true,
                user:secondr.rows
            })
        }
        res.json({
            message:'Director ya existente',
            status: false,
            body:{
                user:{nombre, apellido}
            }
         })
        
    }catch (e){
        console.log("ERROR")

        res.status(400).json({
            message:'Error'
        })
    }

}


const createGenero = async (req, res) => {
    try{
        const {genero} = req.body

        const prof = await pool.query('SELECT * FROM generos WHERE genero = $1',[genero])
        
        console.log(genero)
        console.log(prof.rows)
         
        if(prof.rowCount ===0){
            const response = await pool.query('insert into generos(genero) values($1)',[genero])
            
            console.log(response)
            const secondr =  await pool.query('select * from generos WHERE genero = $1', [genero])
            return res.json({
                message:'Agregada el genero',
                status: true,
                user:secondr.rows
            })
        }
        res.json({
            message:'genero ya existente',
            status: false,
            body:{
                user:{nombre, apellido}
            }
         })
        
    }catch (e){
        console.log("ERROR")

        res.status(400).json({
            message:'Error'
        })
    }

}


const createPremio = async (req, res) => {
    try{
        const {nombre,desc } = req.body

        const prof = await pool.query('SELECT * FROM premios WHERE nombre = $1',[nombre])
        
        console.log(nombre,desc)
        console.log(prof.rows)
         
        if(prof.rowCount ===0){
            const response = await pool.query('insert into premios(nombre,descripcion) values($1,$2)',[nombre,desc])
            
            console.log(response)
            const secondr =  await pool.query('select * from premios WHERE nombre = $1', [nombre])
            return res.json({
                message:'Agregada el premio',
                status: true,
                user:secondr.rows
            })
        }
        return res.json({
            message:'Premio ya existente',
            status: false,
            body:{
                user:{nombre, apellido}
            }
         })
        
    }catch (e){
        console.log("ERROR")

        res.status(400).json({
            message:'Error',
            e:e
        })
    }

}

const createrelActores = async (req, res) => {
    try{
        const {id_contenido, id_actor} = req.body
 
        console.log(id_contenido, id_actor)
         
        const response = await pool.query('insert into actua(id_contenido,id_actor) values($1,$2)',[id_contenido, id_actor])
        
        console.log(response.rows)
        return res.json({
            message:'Agregada el relacion actor',
            status: true,
            user:response.rows
        })
        
    }catch (e){
        console.log("ERROR",e)

        res.status(400).json({
            message:'Error',
            e:e
        })
    }

}

const createrelDirector = async (req, res) => {
    try{
        const {id_contenido, id_director} = req.body
 
        console.log(id_contenido, id_director)
         
        const response = await pool.query('insert into dirigio(id_contenido,id_director) values($1,$2)',[id_contenido, id_director])
        
        console.log(response.rows)
        return res.json({
            message:'Agregada el relacion director',
            status: true,
            user:response.rows
        })
        
    }catch (e){
        console.log("ERROR")

        res.status(400).json({
            message:'Error'
        })
    }

}


const createrelGenero = async (req, res) => {
    try{
        const {id_contenido, id_genero} = req.body
 
        console.log(id_contenido, id_genero)
         
        const response = await pool.query('insert into contenido_genero(id_contenido,id_genero) values($1,$2)',[id_contenido, id_genero])
        
        console.log(response.rows)
        return res.json({
            message:'Agregada el relacion genero',
            status: true,
            user:response.rows
        })
        
    }catch (e){
        console.log("ERROR")

        res.status(400).json({
            message:'Error'
        })
    }

}


const createrelPremio = async (req, res) => {
    try{
        const {id_contenido, id_premio} = req.body
 
        console.log(id_contenido, id_premio)
         
        const response = await pool.query('insert into gano(id_contenido,id_premio) values($1,$2)',[id_contenido, id_premio])
        
        console.log(response.rows)
        return res.json({
            message:'Agregada el relacion premio',
            status: true,
            user:response.rows
        })
        
    }catch (e){
        console.log("ERROR")

        res.status(400).json({
            message:'Error',
            e:e
        })
    }

}


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
    AnuncioVisto,
    createAdmin,
    AdminCheck,
    updateAdminUser,
    createPelis,
    deleteAdminUser,
    getAnuncio,
    getAnunciante,
    createAnunciante,
    createAnuncio,
    getReporte1,
    getReporte2,
    getReporteD,
    getReporteA,
    getReporte4,
    getReporte5,
    getActores,
    getDirector,
    getGenero,
    getPremio,
    createActores,
    createDirector,
    createGenero,
    createPremio,
    createrelActores,
    createrelDirector,
    createrelGenero,
    createrelPremio
}