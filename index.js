const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')

const config = require('./config.json')
const users = require('./users')
const chats = require('./chats')
const sockets = require('./sockets')

console.log('loading saved data')
users.init()
chats.init()
console.log('data loaded')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.use(express.static('public'))
app.use('/user', users.router)
app.use('/chat', users.authMiddleware)
app.use('/chat', chats.router)

const server = http.createServer(app)

sockets.init(server)

server.listen(config.port, () => {
  console.log('Server is running on ' + process.env.PORT || config.port)
})

process.on('exit', exit)
process.on('SIGINT', exit)

function exit () {
  users.exit()
  chats.exit()
  process.exit()
}
