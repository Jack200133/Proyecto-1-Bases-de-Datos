const {Router} = require('express')
const router = Router()
const {getUsers,createUser,getUserByID,delUser,updateUser}= require("../controllers/index.controller")


router.get('/users',getUsers)
router.get('/users/:id',getUserByID)
router.post('/users',createUser)
router.delete('/users/:id',delUser)
router.put('/users/:id',updateUser)
module.exports = router