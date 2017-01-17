module.exports = {
  port: 3000,
  jwtSecret: "someSecret",
  mongoUrl: process.env.PRODUCTION ? "mongodb://production/chat" : "mongodb://localhost/chat",
  bcryptSaltRounds: 10
}
