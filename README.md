# Installation
1. `npm install` to install all dependencies
2. configure mongodb in `config.js`
3. (optional) adjust settings and secrets in `config.js`
4. `npm start` to start the server
5. the server runs (by default) on `localhost:3000`

# Overview

- /public folder: static files for website
- index.js: main JS file to run
- config.js: configuration file to globally adjust settings
- db.js: database connection, query and validation logic
- sockets.js: socket.io realtime communication logic
- users.js, chats.js: HTTP Routes for API
