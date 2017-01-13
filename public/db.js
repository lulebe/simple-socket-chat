const Sequelize = require('sequelize')

const sequelize = new Sequelize(null, null, null, {
  dialect: 'sqlite',
  storage: 'db.sqlite'
})

const User = sequelize.define('user', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

const Chat = sequelize.define('chat', {

})

const Message = sequelize.define('message', {
  message: {
    type: Sequelize.TEXT,
    allowNull: false
  }
})

//TODO associate Chat with User

Chat.hasMany(Message)
Message.belongsTo(Chat)
User.hasMany(Message)
Message.belongsTo(User)
