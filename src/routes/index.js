const {Router} = require('express')
const router = Router()
const {getUsers,
    createUser,
    getUserByID,
    delUser,
    updateUser,
    getPelis,
    getPelisByName,
    getPelisByID,
    passwordCheck,
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
    getUsersByCorreo,
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
    createAnuncio
}= require("../controllers/index.controller")

// http://localhost:5000/users/3
router.get('/',getUsers)
router.get('/users',getUsers)
router.get('/users/:id',getUserByID)
router.get('/usersC/:correo', getUsersByCorreo) 
router.post('/users',createUser)
router.delete('/users/:id',delUser)
router.put('/users/:id',updateUser)
router.get('/pelis',getPelis)
router.post('/pelis', createPelis)
router.get('/pelis/:id',getPelisByID)
router.get('/passcheck/:correo/:pass',passwordCheck)
router.get('/pelis/nombre/:id',getPelisByName)
router.get('/pelis/actor/:id',getPelisByActor)
router.get('/pelis/genero/:id',getPelisByGenero)
router.get('/pelis/directores/:id',getPelisByDirector)
router.get('/pelis/premio/:id',getPelisByPremio)
router.get('/pelis/categoria/:id',getPelisByCategoria)
router.get('/pelis/fecha/:id',getPelisByFecha)
router.get('/perfil/:correo',getPerfilByCorreo)
router.post('/visto/:id',createVisto)
router.get('/visto/:id',getVistoByID)
router.post('/viendo/:id',createViendo)
router.get('/viendo/:id',getViendoByID)
router.post('/fav/:id',createFav)
router.get('/fav/:id',getFavByID)
router.post('/profile', createProfile)
router.post('/adseen', AnuncioVisto)
router.get('/profile/:id/:sus/:num',updateProf)
router.get('/anuncios', getAnuncios)
router.get('/recom/:id', getRecomendaciones)
router.get('/viendo/:id/:viendo',updateViendo)
router.post('/admin/',createAdmin)
router.get('/admin/:name/:pass',AdminCheck)
router.put('/admin/:id',updateAdminUser)
router.delete('/admin/:id',deleteAdminUser)
router.get('/anuncio',getAnuncio)
router.post('/anuncio',createAnuncio)
router.get('/anunciante',getAnunciante)
router.post('/anunciante',createAnunciante)

module.exports = router