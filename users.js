const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')
const userRouter = require('express').Router()

const config = require('./config.json')

const DATA_PATH = path.join(__dirname, 'userdata.json')

var users = {}
var passwords = {}

module.exports = {init: init, exit: exit, router: userRouter, findByName: findByName, authMiddleware}

//init & exit functions
function init () {
  if (!fs.existsSync(DATA_PATH)) return
  const json = fs.readFileSync(DATA_PATH, 'utf8')
  try {
    const data = JSON.parse(json)
    users = data.users
    passwords = data.passwords
  } catch (e) {}
}

function exit () {
  const json = JSON.stringify({users: users, passwords: passwords})
  fs.writeFileSync(DATA_PATH, json)
}



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
  const token = req.get('authorization') || req.query.token || req.body.access_token
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
}

userRouter.post('/', (req, res) => {
  //check correct parameters
  if (!req.body.username || !req.body.password) {
    res.status(400).send({msg: "Bad Parameters"})
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
  users[username] = {username}
  passwords[username] = password
  res.status(201).send(createJwt(username))
})

userRouter.post('/login', (req, res) => {
  //check correct parameters
  if (!req.body.username || !req.body.password) {
    res.status(400).send({msg: 'Bad Parameters'})
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
  if (passwords[username] === password) {
    res.status(200).send(createJwt(username))
  } else {
    res.status(404).send({msg: "Password is incorrect"})
  }
})
