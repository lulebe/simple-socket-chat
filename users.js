const jwt = require('jsonwebtoken')
const userRouter = require('express').Router()
const bcrypt = require('bcrypt')

const config = require('./config')
const models = require('./db').models

module.exports = {router: userRouter, findByName: findByName, authMiddleware}


//HELPERS


//sign jwt for user
function createJwt (userId) {
  return jwt.sign({userId}, config.jwtSecret, {expiresIn: "12h"})
}

//add user as req.user to request or respond with error
function authMiddleware (req, res, next) {
  const token = req.get('authorization') || req.query.token || req.body.access_token
  if (!token) {
    res.status(401).send({msg: "No access token provided"})
    return
  }
  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err || !decoded.userId)
      return res.status(401).send({msg: "Invalid token"})
    //add user object to request as req.user
    models.User.findById(decoded.userId, (err, user) => {
      if (err)
        return res.status(500).send(err)
      req.user = user
      next()
    })
  })
}


//ROUTES


//create new user
userRouter.post('/', (req, res) => {
  //check correct parameters
  if (!req.body.username || !req.body.password)
    return res.status(400).send({msg: "Bad Parameters"})
  //remove leading and trailing spaces
  const username = req.body.username.trim()
  //unauthorized if user exists already
  models.User.findOne({name: username}, (err, registeredUser) => {
    if (err)
      return res.status(500).send(err)
    if (registeredUser != null)
      return res.status(403).send({msg: 'Username is already taken'}))
    //add user
    bcrypt.hash(req.body.password, config.bcryptSaltRounds, (err, hash) => {
      if (err)
        return res.status(500).send(err)
      const newUser = new models.User({name: username, password: hash})
      newUser.save((err, user) => {
        if (err)
          return res.status(500).send(err)
        res.status(201).send(createJwt(user.id))
      })
    })
  })
})

//create jwt for existing user
userRouter.post('/login', (req, res) => {
  //check correct parameters
  if (!req.body.username || !req.body.password) {
    res.status(400).send({msg: 'Bad Parameters'})
    return
  }
  //remove leading and trailing spaces
  const username = req.body.username.trim()
  models.User.findOne({name: username}, (err, user) => {
    if (err)
      return res.status(500).send(err)
    //check if user even exists
    if (!user)
      return res.status(404).send({msg: "Username was not found"})
    bcrypt.compare(req.body.password, user.password, (err, pwCorrect) => {
      if (err)
        return res.status(500).send(err)
      if (!pwCorrect)
        return res.status(404).send({msg: "Password is incorrect"})
      res.status(200).send(createJwt(user.id))
    })
  })
})

//search user by username
userRouter.get('/search', (req, res) => {
  if (!req.query.q)
    return res.status(400).send({msg: "No search query param (q) provided"})
  models.User.findOne({username: req.query.q}).select('name').exec((err, user) {
    if (err)
      return res.status(500).send(err)
    res.status(200).send(user)
  })
})

//get info about user by userId
userRouter.get('/:userid', (req, res) => {
  //find user and return only id and username, not password!
  models.User.findById(req.params.userid).select('name').exec((err, user) => {
    if (err)
      return res.status(500).send(err)
    if (!user)
      return res.status(404).send({msg: 'User was not found'}))
    res.status(200).send(user)
})
