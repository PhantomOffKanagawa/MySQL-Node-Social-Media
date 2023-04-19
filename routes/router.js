const express = require('express');
const router = express.Router();
const dbHelper = require('../helpers/dbHelper');
const passport = require('../helpers/passportHelper');
const crypto = require('crypto');


router.use(passport.initialize())
router.use(passport.session())

// GET Routes
//
//

// Landing Page
router.get('/', (req, res) => {
  res.render('index.ejs', { title: 'Home' })
})

// Page to Login
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' })
})

// Page to Logout
router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

// Directed page on success
router.get('/login-success', (req, res, next) => {
  res.send(
    '<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>'
  )
})

// Directed page on failure
router.get('/login-failure', (req, res, next) => {
  res.send('You entered the wrong password.')
})

// Page to register
router.get('/register', (req, res, next) => {
  res.render('register', { title: 'Register' })
})

// Page requiring authentication
router.get('/protected-route',isAuth,(req, res, next) => {
 
  res.send('<h1>You are authenticated</h1><p><a href="/logout">Logout and reload</a></p>');
});

// Page shown on failure to be authenticated where needed
router.get('/notAuthorized', (req, res, next) => {
  console.log("Inside get");
  res.send('<h1>You are not authorized to view the resource </h1><p><a href="/login">Retry Login</a></p>');
  
});

// Page shown when trying to register existing username
router.get('/userAlreadyExists', (req, res, next) => {
  console.log("Inside get");
  res.send('<h1>Sorry This username is taken </h1><p><a href="/register">Register with different username</a></p>');
  
});

// POST Routes
//
//

// Handle registration
router.post('/register', userExists, (req, res, next) => {
  console.log('Inside post Salt:')
  const saltHash = genPassword(req.body.password)
  console.log(saltHash)
  const salt = saltHash.salt
  const hash = saltHash.hash
  console.log(typeof salt)

  dbHelper.insertUser(
    req.body.username,
    new Date().toISOString(),
    '2000-01-05',
    'Description for user5',
    'Location for user5',
    hash,
    saltHash.salt
  )
  
  res.redirect('/login')
})

// Handle Login attempts
router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login-failure',
    successRedirect: '/login-success'
  })
)

// Helpers
//
//

// Helper to check if a username is already in use 
function userExists (req, res, next) {
  dbHelper.mediaConnection.query(
    'Select * from USER where Username=? ',
    [req.body.username],
    function (error, results, fields) {
      if (error) {
        console.log(error)
      } else if (results.length > 0) {
        res.redirect('/userAlreadyExists')
      } else {
        next()
      }
    }
  )
}

// Helper to generate encrypted passwords
function genPassword (password) {
  var salt = crypto.randomBytes(32).toString('hex')
  var genhash = crypto
    .pbkdf2Sync(password, salt, 10000, 60, 'sha512')
    .toString('hex')
  return { salt: salt, hash: genhash }
}

// Helper to check if a user is logged in
function isAuth (req, res, next) {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.redirect('/notAuthorized')
  }
}

module.exports = router
