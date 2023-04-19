const crypto = require('crypto');
const mysql = require('mysql2');

const express = require('express');
const app = express();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const expressLayouts = require('express-ejs-layouts');

const dbHelper = require('./helpers/dbHelper')
const routes = require('./routes/router')

require('dotenv').config();

// const storeOptions = {
//   host: process.env.DB_HOST,
//   user: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   port: 3306,
//   database: 'cookie_user',
//   createDatabaseTable: true
// }

// Middlewear and Express setup
app.use(
  session({
    key: process.env.COOKIE_KEY,
    secret: process.env.COOKIE_SECRET,
    store: new MySQLStore({}, dbHelper.mediaConnection),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    }
  })
)

app.use(expressLayouts)
app.set('layout', './layouts/default')

app.use(express.urlencoded({ extended: false }))

app.set('view engine', 'ejs')

app.use(routes)

app.use((req,res,next)=>{
  console.log(req.session);
  console.log(req.user);
  next();
});

const customFields = {
  usernameField: 'uname',
  passwordField: 'pw'
}


/*middleware*/
function validPassword (password, hash, salt) {
  var hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 60, 'sha512')
    .toString('hex')
  return hash === hashVerify
}

function isAuth (req, res, next) {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.redirect('/notAuthorized')
  }
}

function isAdmin (req, res, next) {
  if (req.isAuthenticated() && req.user.isAdmin == 1) {
    next()
  } else {
    res.redirect('/notAuthorizedAdmin')
  }
}






// Set up Express server
const server = app.listen(3000, () => {
  console.log(`Listening on port ${server.address().port}`)
})