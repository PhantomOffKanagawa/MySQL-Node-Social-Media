const crypto = require('crypto')
const mysql = require('mysql2')

const express = require('express')
const app = express()
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)
const expressLayouts = require('express-ejs-layouts')

require('dotenv').config()

const dbHelper = require('./helpers/dbHelper')
const routes = require('./routes/router')

// Middlewear and Express setup
// Cookie setup
const sessionMiddleware = session({
  key: process.env.COOKIE_KEY,
  secret: process.env.COOKIE_SECRET,
  store: new MySQLStore({}, dbHelper.mediaConnection),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
})

app.use(sessionMiddleware)

// Serve files under static folder as static
app.use(express.static('static'))

// Use express layouts based on created default layout
app.use(expressLayouts)
app.set('layout', './layouts/default')

app.use(express.urlencoded({ extended: false }))

// Use ejs view engine
app.set('view engine', 'ejs')

// Use routes file for GET / POST
app.use(routes)

// app.use((req,res,next)=>{
//   console.log(req.session);
//   console.log(req.user);
//   next();
// });

// Start up Express server
const server = app.listen(3000, () => {
  console.log(`Listening on port ${server.address().port}`)
})
