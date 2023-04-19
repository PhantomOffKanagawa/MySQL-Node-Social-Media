const express = require('express');
const router = express.Router();
const dbHelper = require('../helpers/dbHelper');
const passport = require('../helpers/passportHelper');
const crypto = require('crypto');


router.use(passport.initialize())
router.use(passport.session())

// GET Routes
router.get('/', (req, res) => {
  res.render('index.ejs', { title: 'Home' })
})

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' })
})

router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

router.get('/login-success', (req, res, next) => {
  res.send(
    '<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>'
  )
})

router.get('/login-failure', (req, res, next) => {
  res.send('You entered the wrong password.')
})

router.get('/register', (req, res, next) => {
  res.render('register', { title: 'Register' })
})

// POST Routes

router.post('/register', userExists, (req, res, next) => {
  console.log('Inside post')
  console.log(req.body.password)
  const saltHash = genPassword(req.body.password)
  console.log(saltHash)
  const salt = saltHash.salt
  const hash = saltHash.hash

  // dbHelper.insertUser(req.body.username,hash,salt)
  dbHelper.insertUser(
    req.body.username,
    'password5',
    1620000000,
    '2000-01-05',
    'Description for user5',
    'Location for user5',
    hash,
    salt
  )

  res.redirect('/login')
})

router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login-failure',
    successRedirect: '/login-success'
  })
)

// Helpers

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

function genPassword (password) {
  var salt = crypto.randomBytes(32).toString('hex')
  var genhash = crypto
    .pbkdf2Sync(password, salt, 10000, 60, 'sha512')
    .toString('hex')
  return { salt: salt, hash: genhash }
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

module.exports = router
