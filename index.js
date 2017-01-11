const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')

const config = require('./config.json')
const users = require('./users')
const chats = require('./chats')
const sockets = require('./sockets')


const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.use(express.static('public'))
app.use('/user', users.router)
app.use('/chat', users.authMiddleware)
app.use('/chat', chats.router)

const server = http.createServer(app)

sockets(server)

server.listen(config.port, () => {
  console.log("Server is running on " + config.port)
})
