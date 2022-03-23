const express = require('express')
const app = express()

// defino middlewares 
app.use(express.json())
app.use(express.urlencoded({extended: false}))

// defino mis rutas
app.use(require('./routes/index'))

app.listen(3000)
console.log("Server de pruebas")
