const mongoose = require('mongoose')
const Schema = mongoose.Schema

const config = require('./config')

const models = {
  User: null,
  Chat: null
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
chatSchema.statics.getIfForUser = function (chatId, userId, cb) {
  return this.findById(chatId).where({members: userId}).exec(cb)
}
chatSchema.methods.isGroup = function () {
  return this.members.length > 2
}
