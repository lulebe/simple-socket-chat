/*
TODO
1. use mongo instead of object looksups everywhere
2. use userIds instead of usernames
*/



const UUID = require('node-time-uuid')
const chatRouter = require('express').Router()

const config = require('./config')
const eventnames = require('./socketevents.json')
const users = require('./users')
const sockets = require('./sockets')
const models = require('./db').models

module.exports = {router: chatRouter}


//HELPERS


//TODO fully implement
function chatWithoutMessages (chat) {
  const newChatInstance = Object.assign({}, chat)
  delete newChatInstance.messages
  return newChatInstance
}

//TODO fully implement
function getOrCreateChat (userA, userB) {
  const matches = chats.filter(chat =>
    (chat.userA === userA && chat.userB === userB) ||
    (chat.userA === userB && chat.userB === userA)
  )
  if (matches.length === 1)
    return matches[0]
  const chat = {userA, userB, messages: []}
  chats.push(chat)
  sockets.sendToUser(
    userB,
    eventnames.createdChat,
    {chat: chat}
  )
  return chat
}

//TODO fully implement
function insertMessageIntoChat(chat, user, message, cb) {
  const msg = {
    by: user,
    content: message,
    edited: false
  }
  cb()
}

//TODO fully implement
function updateMessage(chat, messageId, username, message) {
  const matches = chat.messages.filter(msg => msg.id === messageId && msg.by === username)
  if (matches.length !== 1)
    return null
  const msg = matches[0]
  msg.msg = messages
  msg.edited = true
  sockets.sendToUser(
    userB,
    eventnames.messageUpdate,
    {chatWith: user, message: msg}
  )
  return msg
}


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
  users.concat(req.body.partners)
  const chat = new models.Chat({
    members: users,
    groupName: req.body.groupName,
    messages: []
  })
  chat.save((err, chat) => {
    if (err)
      return res.status(500).send(err)
    res.status(201).send(chat)
  })
})

//TODO fully implement
//post new message into chat if allowed to
chatRouter.post('/:chatid/message', (req, res) => {
  if (!req.body.message) {
    res.status(400).send({msg: "No message was specified"})
    return
  }
  const chat = getChatIfExists(req.user.username, users.findByName(req.params.username).username)
  if (!chat) {
    res.status(404).send({msg: "Chat was not found"})
    return
  }
  const message = insertMessageIntoChat(chat, req.user.username, req.body.message)
  res.status(201).send(message)
})

//TODO fully implement
//change message if allowed to
chatRouter.put('/:chatid/message/:messageid', (req, res) => {
  if (!req.body.message) {
    res.status(400).send({msg: "No message was specified"})
    return
  }
  const chat = getChatIfExists(req.user.username, users.findByName(req.params.username).username)
  if (!chat) {
    res.status(404).send({msg: "Chat was not found"})
    return
  }
  const message = updateMessage(chat, req.params.messageid, req.user.username, req.body.message)
  if (!message) {
    res.status(404).send({msg: 'Message was not found'})
    return
  }
  res.status(201).send(message)
})
