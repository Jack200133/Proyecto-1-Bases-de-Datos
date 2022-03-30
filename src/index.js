const express = require('express')
const app = express()
const cors = require('cors')

// defino middlewares 
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

// defino mis rutas
app.use(require('./routes/index'))

app.listen(5000)
console.log("Server de pruebas")
