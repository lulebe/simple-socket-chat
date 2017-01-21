const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')

const config = require('./config')
const db = require('./db')
const users = require('./users')
const chats = require('./chats')
const sockets = require('./sockets')


//start server after connection to Database
db.init(() => {
  //create express app and load parsing middleware
  const app = express()
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: false}))

  //serve static files and api
  app.use(express.static('public'))
  app.use('/uploads', express.static('uploads'))
  app.use('/user', users.router)
  app.use('/chat', users.authMiddleware)
  app.use('/chat', chats.router)

  //create http server for express and socket.io
  const server = http.createServer(app)
  sockets.init(server)
  server.listen(config.port, () => {
    console.log('Server is running on ' + config.port)
  })
})
