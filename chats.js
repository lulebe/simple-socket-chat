const uuid = require('node-time-uuid')
const chatRouter = require('express').Router()

const config = require('./config.json')
const users = require('./users')

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

function getOrCreateChat (userA, userB) {
  const matches = chats.filter(chat =>
    (chat.userA === userA && chat.userB === userB) ||
    (chat.userA === userB && chat.userB === userA)
  )
  if (matches.length === 1)
    return matches[0]
  const chat = {userA, userB, messages: {}}
  chats.push(chat)
  return chat
}

function insertMessageIntoChat(chat, user, message) {
  const id =
  const msg = {
    id: id,
    by: user.username,
    at: new Date().toISOString(),
    msg: message
  }
  chat.messages[id] = msg
  return msg
}

function getChatsForUser (user) {
  return chats.filter(chat =>
    chat.userA === userA || chat.userB === userA
  )
}

chatRouter.get('/', (req, res) => {
  res.status(200).send(getChatsForUser.map(chat => {
    const newChatInstance = Object.assing({}, chat)
    delete newChatInstance.messages
  }))
})

chatRouter.get('/:username', (req, res) => {
  const partner = users.findByName(req.params.username)
  if (!partner) {
    res.status(404).send({msg: "Chat partner does not exist"})
    return
  }
  const chat = getOrCreateChat(req.user, partner)
  res.status(200).send(chat)
})

chatRouter.post('/:username/message', (req, res) => {
  if (!req.body.message) {
    res.status(400).send({msg: "No message was specified"})
  }
  const chat = getChatIfExists(req.user, users.findByName(req.params.username))
  if (!chat) {
    res.status(404).send({msg: "Chat was not found"})
    return
  }
  const message = insertMessageIntoChat(chat, req.user, req.body.message)
  res.status(201).send(message)
})
