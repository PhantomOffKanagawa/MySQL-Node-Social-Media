const express = require('express')
const app = express()
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)

const cors = require('cors');
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

// cors
app.use(cors({
  origin: 'http://localhost:300',
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({
  extended: false
}));

// Use routes file for GET / POST
app.use(routes)



// Use express layouts based on created default layout
app.use(expressLayouts)
app.set('layout', './0_skeleton')

// app.use(express.urlencoded({ extended: false }))

// Use ejs view engine
app.set('view engine', 'ejs')

// Start up Express server
const server = app.listen(8082, () => {
  console.log(`Listening on port ${server.address().port}`)
})