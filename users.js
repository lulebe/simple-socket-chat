const jwt = require('jsonwebtoken')
const userRouter = require('express').Router()

const config = require('./config.json')

const users = {}

module.exports = {router: userRouter, findByName: findByName, authMiddleware}

function userExists (username) {
  return users[username] != undefined
}

function createJwt (username) {
  return jwt.sign({username}, config.jwt_secret, {expiresIn: "12h"})
}

function findByName (username) {
  return users[username]
}

function authMiddleware (req, res, next) {
  const token = req.headers['x-access-token'] || req.query.token || req.body.access_token
  if (!token) {
    res.status(401).send({msg: "No access token provided"})
    return
  }
  jwt.verify(token, config.jwt_secret, (err, decoded) => {
    if (err || !decoded.username) {
      res.status(401).send({msg: "Invalid token"})
      return
    }
    req.user = users[decoded.username]
    next()
  })
  next()
}

userRouter.post('/', (req, res) => {
  //check correct parameters
  if (!req.body.username || req.body.password) {
    res.status(400).send()
    return
  }
  //remove leading and trailing spaces
  const username = req.body.username.trim()
  const password = req.body.password
  //unauthorized if user exists already
  if (userExists(username)) {
    res.status(403).send({msg: 'Username is already taken'})
    return
  }
  //add user
  users[username] = {password}
})

userRouter.post('/login', (req, res) => {
  //check correct parameters
  if (!req.body.username || req.body.password) {
    res.status(400).send()
    return
  }
  //remove leading and trailing spaces
  const username = req.body.username.trim()
  const password = req.body.password
  //check if user even exists
  if (!userExists(username)) {
    res.status(404).send({msg: "Username was not found"})
    return
  }
  if (users[username].password === password) {
    res.status(200).send(createJwt(username))
  } else {
    res.status(404).send({msg: "Password is incorrect"})
  }
})
