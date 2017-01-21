const mongoose = require('mongoose')
const Schema = mongoose.Schema

const config = require('./config')
const socketevents = require('./socketevents.json')
const sockets = require('./sockets')

const models = {
  User: null,
  Chat: null
}

//define Schemas

const userSchema = Schema({
  name: {type: String, required: true},
  password: {type: String, required: true}
})

userSchema.methods.getChats = function (cb) {
  return models.Chat.find({members: this.id}).select('-messages').populate('members', 'name').exec(cb);
}


const chatSchema = Schema({
  groupName: String,
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: function(v, cb) {
        models.User.findById(v, (err, user) => {
          cb(!err && user != null)
        })
      },
      message: '{VALUE} is not a registered user'
    },
  }],
  messages: [{
    content: {type: String, required: true},
    by: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    date: {type: Date, default: Date.now},
    edited: Boolean
  }]
})

chatSchema.statics.createChat = function (members, groupName, cb) {
  const chat = new models.Chat({
    members: members,
    groupName: groupName,
    messages: []
  })
  chat.save((err, createdChat) => {
    if (err)
      return cb(err)
    models.Chat.findById(createdChat.id).populate('members', 'name').exec((err, popChat) => {
      if (err)
        return cb(err)
      popChat.members.forEach(member => {
        sockets.sendToUser(member.id, socketevents.createdChat, popChat)
      })
      cb(null, popChat)
    })
  })
}

chatSchema.statics.getIfForUser = function (chatId, userId, cb) {
  return this.findById(chatId).where({members: userId}).populate('members', 'name').exec(cb)
}

chatSchema.methods.isGroup = function () {
  return this.members.length > 2
}

chatSchema.methods.addMessageByUser = function (userId, message, cb) {
  if (this.members.some(mem => mem.equals(userId))) {
    const newMessage = this.messages.create({
      content: message,
      by: userId,
      edited: false
    })
    this.messages.push(newMessage)
    this.save((err, chat) => {
      if (err)
        return cb(err)
      //socket updates
      this.members.forEach(member => {
        sockets.sendToUser(member, socketevents.newMessage, {chatid: chat.id, message: newMessage})
      })
      cb(null, newMessage)
    })
  } else {
    cb({httpStatus: 403, msg: "user is not a chat member"})
  }
}

chatSchema.methods.addImageByUser = function (userId, imageUrl, cb) {
  if (this.members.some(mem => mem.equals(userId))) {
    const newMessage = this.messages.create({
      content: imageUrl,
      by: userId,
      image: true,
      edited: false
    })
    this.messages.push(newMessage)
    this.save((err, chat) => {
      if (err)
        return cb(err)
      //socket updates
      this.members.forEach(member => {
        sockets.sendToUser(member, socketevents.newMessage, {chatid: chat.id, message: newMessage})
      })
      cb(null, newMessage)
    })
  } else {
    cb({httpStatus: 403, msg: "user is not a chat member"})
  }
}

chatSchema.methods.updateMessage = function (messageId, userId, message, cb) {
  const chat = this
  const storedMessage = chat.messages.id(messageId)
  if (!storedMessage.by.equals(userId))
    return cb({httpStatus: 403, msg: "User is not authorized to edit this message"})
  storedMessage.edited = true
  storedMessage.content = message
  storedMessage.date = Date.now()
  chat.save((err, updatedChat) => {
    updatedChat.members.forEach(member => {
      sockets.sendToUser(member, socketevents.messageUpdate, {chatid: chat.id, message: storedMessage})
    })
    cb(err, storedMessage)
  })
}



//Init mongodb connection
const init = cb => {
  mongoose.connect(config.mongoUrl)
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error: '))
  db.once('open', function() {
    models.User = mongoose.model('User', userSchema)
    models.Chat = mongoose.model('Chat', chatSchema)
    cb()
  });
}

module.exports = {models, init}
