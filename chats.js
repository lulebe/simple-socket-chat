const UUID = require('node-time-uuid')
const chatRouter = require('express').Router()

const config = require('./config')
const eventnames = require('./socketevents.json')
const users = require('./users')
const sockets = require('./sockets')
const models = require('./db').models

module.exports = {router: chatRouter}


//ROUTES


//get metadata for all chats of current users
chatRouter.get('/', (req, res) => {
  req.user.getChats((err, chats) => {
    if (err)
      return res.status(500).send(err)
    res.status(200).send(chats)
  })
})

//get chat with messages by id, error if user is no member
chatRouter.get('/:chatid', (req, res) => {
  models.Chat.getIfForUser(req.params.chatid, req.user.id, (err, chat) => {
    if (err)
      return res.status(500).send(err)
    if (!chat)
      return res.status(404).send({msg: "Chat was not found"})
    res.status(200).send(chat)
  })
})

//create chat with partners and optional groupName
chatRouter.post('/', (req, res) => {
  if (!req.body.partners)
    return res.status(400).send({msg: "No chat partners specified"})
  const users = [req.user.id]
  req.body.partners.forEach(partner => {
    users.push(partner)
  })
  models.Chat.createChat(users, req.body.groupName, (err, chat) => {
    if (err)
      return res.status(500).send(err)
    res.status(201).send(chat)
  })
})

//post new message into chat if allowed to
chatRouter.post('/:chatid/message', (req, res) => {
  if (!req.body.message)
    return res.status(400).send({msg: "No message was specified"})
  models.Chat.getIfForUser(req.params.chatid, req.user.id, (err, chat) => {
    if (err)
      return res.status(500).send(err)
    if (!chat)
      return res.status(404).send({msg: "Chat was not found"})
    chat.addMessageByUser(req.user.id, req.body.message, (err, message) => {
      if (err && err.httpStatus)
        return res.status(err.httpStatus).send({msg: err.msg})
      if (err)
        return res.status(500).send(err)
      res.status(201).send(message)
    })
  })
})

//change message if allowed to
chatRouter.put('/:chatid/message/:messageid', (req, res) => {
  if (!req.body.message)
    return res.status(400).send({msg: "No message was specified"})
  models.Chat.findById(req.params.chatid, (err, chat) => {
    if (err)
      return res.status(500).send(err)
    if (!chat)
      return res.status(404).send({msg: "Chat does not exist"})
    chat.updateMessage(req.params.messageid, req.user.id, req.body.message, (err, message) => {
      if (err && err.httpStatus)
        return res.status(err.httpStatus).send({msg: err.msg})
      if (err)
        return res.status(500).send(err)
      res.status(200).send(message)
    })
  })
})
