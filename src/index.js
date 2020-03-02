const express = require('express')
require('./db/mongoose')
const userRouter = require('./router/user')
const app = express()

const port  = process.env.port || 3000

app.use(express.json())
app.use(userRouter)

app.listen(port, () =>{
    console.log('CV app is up and running on port ' + port)
})