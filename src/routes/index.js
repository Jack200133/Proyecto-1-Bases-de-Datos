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
    getPelisByFecha}= require("../controllers/index.controller")

// http://localhost:5000/users/3
router.get('/users',getUsers)
router.get('/users/:id',getUserByID)
router.post('/users',createUser)
router.delete('/users/:id',delUser)
router.put('/users/:id',updateUser)
router.get('/pelis',getPelis)
router.get('/pelis/:id',getPelisByID)
router.get('/pass/:id',passwordCheck)
router.get('/pelis/nombre/:id',getPelisByName)
router.get('/pelis/actor/:id',getPelisByActor)
router.get('/pelis/genero/:id',getPelisByGenero)
router.get('/pelis/directores/:id',getPelisByDirector)
router.get('/pelis/premio/:id',getPelisByPremio)
router.get('/pelis/categoria/:id',getPelisByCategoria)
router.get('/pelis/fecha/:id',getPelisByFecha)
module.exports = router