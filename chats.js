const UUID = require('node-time-uuid')
const chatRouter = require('express').Router()

const config = require('./config.json')
const eventnames = require('./socketevents.json')
const users = require('./users')
const sockets = require('./sockets')

const chats = []

module.exports = {router: chatRouter}

function getChatIfExists (userA, userB) {
  const matches = chats.filter(chat =>
    (chat.userA === userA && chat.userB === userB) ||
    (chat.userA === userB && chat.userB === userA)
  )
  if (matches.length === 1)
    return matches[0]
  return null
}

function chatWithoutMessages (chat) {
  const newChatInstance = Object.assign({}, chat)
  delete newChatInstance.messages
  return newChatInstance
}

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

function insertMessageIntoChat(chat, user, message) {
  const id = new UUID().toString('hex')
  const msg = {
    id: id,
    by: user,
    at: new Date().toISOString(),
    msg: message,
    edited: false
  }
  chat.messages.push(msg)
  const partnername = chat.userA == user ? chat.userB : chat.userA
  sockets.sendToUser(
    partnername,
    eventnames.newMessage,
    {chatWith: user, message: msg}
  )
  return msg
}

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

function getChatsForUser (user) {
  return chats.filter(chat =>
    chat.userA === user || chat.userB === user
  )
}

chatRouter.get('/', (req, res) => {
  res.status(200).send(getChatsForUser(req.user.username).map(chat => chatWithoutMessages(chat)))
})

chatRouter.get('/:username', (req, res) => {
  const partner = users.findByName(req.params.username)
  if (!partner) {
    res.status(404).send({msg: "Chat partner does not exist"})
    return
  }
  const chat = getOrCreateChat(req.user.username, partner.username)
  res.status(200).send(chat)
})

chatRouter.post('/:username/message', (req, res) => {
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

chatRouter.put('/:username/message/:messageId', (req, res) => {
  if (!req.body.message) {
    res.status(400).send({msg: "No message was specified"})
    return
  }
  const chat = getChatIfExists(req.user.username, users.findByName(req.params.username).username)
  if (!chat) {
    res.status(404).send({msg: "Chat was not found"})
    return
  }
  const message = updateMessage(chat, req.params.messageId, req.user.username, req.body.message)
  if (!message) {
    res.status(404).send({msg: 'Message was not found'})
    return
  }
  res.status(201).send(message)
})
