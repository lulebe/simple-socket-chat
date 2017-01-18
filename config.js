module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: "someSecret",
  mongoUrl: process.env.MONGODB_URI || "mongodb://localhost/chat",
  bcryptSaltRounds: 10
}
