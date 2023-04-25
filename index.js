const crypto = require('crypto')
const mysql = require('mysql2')

const express = require('express')
const app = express()
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)
const expressLayouts = require('express-ejs-layouts')

require('dotenv').config()

const dbHelper = require('./helpers/dbHelper')
const routes = require('./helpers/router')

// Initialize MySQLStore for session
const SQLStore = new MySQLStore({}, dbHelper.mediaConnection);

// Middlewear and Express setup
// Cookie setup
const sessionMiddleware = session({
  key: process.env.COOKIE_KEY,
  secret: process.env.COOKIE_SECRET,
  store: SQLStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
})

app.use(sessionMiddleware)

// Use express layouts based on created default layout
app.use(expressLayouts)
app.set('layout', './0_skeleton')

app.use(express.urlencoded({ extended: false }))

// Use ejs view engine
app.set('view engine', 'ejs')

// Use routes file for GET / POST
app.use(routes)

// Start up Express server
const server = app.listen(3000, () => {
  console.log(`Listening on port ${server.address().port}`)
})
