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
  return this.model('Chat').find({members: this.id}).select('-messages').exec(cb);
}


const chatSchema = Schema({
  groupName: String,
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: function(v, cb) {
        this.model('User').findById(v, (err, user) => {
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
  const chat = new this.model('Chat')({
    members: members,
    groupName: groupName,
    messages: []
  })
  chat.save((err, chat) => {
    if (err)
      return cb(err)
    chat.members.forEach(member => {
      sockets.sendToUser(member, socketevents.createdChat, chat)
    })
    cb(null, chat)
  })
}

chatSchema.statics.getIfForUser = function (chatId, userId, cb) {
  return this.findById(chatId).where({members: userId}).exec(cb)
}

//TODO fully implement
chatSchema.statics.updateMessage = function (chatId, messageId, userId, message, cb) {
  //1. find message
  //2. check permission (message.by === userId)
  //3. edit & save message
  //4. send socket updates
  //5. call cb
}

chatSchema.methods.isGroup = function () {
  return this.members.length > 2
}

chatSchema.methods.addMessageByUser = function (userId, message, cb) {
  if (this.members.indexOf(userId) >= 0) {
    this.messages.push({
      content: message,
      by: userId,
      edited: false
    })
    this.save((err, chat) => {
      if (err)
        return cb(err)
      const message = chat.messages[chat.messages.length - 1]
      //socket updates
      this.members.forEach(member => {
        sockets.sendToUser(member, socketevents.newMessage, message)
      })
      cb(null, message)
    })
  } else {
    cb({httpStatus: 403, msg: "user is not a chat member"})
  }
}



//Init mongodb connection
const init = cb => {
  mongoose.connect(config.mongoUrl)
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error: '))
  db.once('open', function() {
    models.User = mongoose.model('User', userSchema)
    models.Chat = mongoose.model('Chat', userSchema)
  });
}

module.exports = {models, init}
