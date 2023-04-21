const express = require('express')
const router = express.Router()
const dbHelper = require('../helpers/dbHelper')
const passport = require('../helpers/passportHelper')
const crypto = require('crypto')

router.use(passport.initialize())
router.use(passport.session())

// GET Routes
//
//

// Landing Page
router.get('/', (req, res) => {
  res.render('index.ejs', {
    title: 'Home'
  })
})

// Page to Login
router.get('/login', isNotAuth, (req, res) => {
  res.render('login', {
    title: 'Login'
  })
})

// Page to Logout
router.get('/logout', (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    res.redirect('/')
  })
})

router.get('/myaccount', isAuth, (req, res, next) => {
  dbHelper.mediaConnection.query(
    'SELECT USER.Username, Birthday, Description, Location, ExternalLinks.Link FROM USER LEFT JOIN ExternalLinks ON USER.Username = ExternalLinks.Username WHERE USER.Username = ' + req.session.passport.user,
    (err, rows) => {
      if (err) throw console.error(err)
      if (!err) {
        // console.log(rows)
        res.render('account', {
          title: 'My Account',
          rows: JSON.stringify(rows),
          user: JSON.stringify(rows[0]),
          username: rows[0].Username,
          editable: true
        })
      }
    }
  )
})

router.get('/account/:username', (req, res, next) => {
  console.log("The parameter is: " + req.params.username);
  dbHelper.mediaConnection.query(
    'SELECT USER.Username, Birthday, Description, Location, ExternalLinks.Link FROM USER LEFT JOIN ExternalLinks ON USER.Username = ExternalLinks.Username WHERE USER.Username = ' + req.params.username,
    (err, rows) => {
      if (err) {
        console.error(err)
        res.send("Username not found")
      }
      if (!err) {
        res.render('account', {
          title: req.params.username + '\'s Account',
          rows: JSON.stringify(rows),
          user: JSON.stringify(rows[0]),
          username: rows[0].Username,
          editable: (req.params.username == req.session.passport.user)
        })
      }
    }
  )
})

// Directed page on success
router.get('/login-success', (req, res, next) => {
  // res.send(
  //   '<p>You successfully logged in. --> <a href="/myaccount">Go to your account</a></p>'
  // )
  res.redirect("/myaccount")
})

// Directed page on failure
router.get('/login-failure', (req, res, next) => {
  res.send('You entered the wrong password.')
})

// Page to register
router.get('/register', isNotAuth, (req, res, next) => {
  res.render('register', {
    title: 'Register'
  })
})

// Page requiring authentication
router.get('/protected-route', isAuth, (req, res, next) => {
  res.send(
    '<h1>You are authenticated</h1><p><a href="/logout">Logout and reload</a></p>'
  )
})

// Page shown on failure to be authenticated where needed
router.get('/notAuthorized', (req, res, next) => {
  console.log('Inside get')
  res.send(
    '<h1>You are not authorized to view the resource </h1><p><a href="/login">Retry Login</a></p>'
  )
})

// Page shown when trying to register existing username
router.get('/userAlreadyExists', (req, res, next) => {
  console.log('Inside get')
  res.send(
    '<h1>Sorry This username is taken </h1><p><a href="/register">Register with different username</a></p>'
  )
})

// POST Routes
//
//

// Handle registration
router.post('/register', userExists, (req, res, next) => {
  // console.log('Inside post Salt:')
  const saltHash = genPassword(req.body.password)
  // console.log(saltHash)
  const salt = saltHash.salt
  const hash = saltHash.hash
  // console.log(typeof salt)

  dbHelper.insertUser(
    req.body.username,
    new Date().toISOString(),
    null,
    null,
    null,
    hash,
    saltHash.salt
  )

  res.redirect('/login')
})

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/login-success',
    failureRedirect: '/login-failed'
  })
)


router.post('/myaccount', isAuth, (req, res, next) => {
  const birthday = req.body.birthday;
  const location = req.body.location;
  const description = req.body.description;
  const username = req.session.passport.user;

  dbHelper.updateUser(username, birthday, description, location);

  res.redirect('/myaccount');
})

router.post('/linkadd', isAuth, (req, res, next) => {
  dbHelper.addLink(req.session.passport.user, req.body.link);

  res.redirect('/myaccount');
});

router.post('/linkremove', (req, res, next) => {
  dbHelper.removeLink(req.session.passport.user, req.body.link);

  res.redirect('/myaccount');
});

// Helpers
//
//

// Helper to check if a username is already in use
function userExists(req, res, next) {
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
function genPassword(password) {
  var salt = crypto.randomBytes(32).toString('hex')
  var genhash = crypto
    .pbkdf2Sync(password, salt, 10000, 60, 'sha512')
    .toString('hex')
  return {
    salt: salt,
    hash: genhash
  }
}

// Helper to check if a user is logged in
function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.redirect('/notAuthorized')
  }
}

// Helper to check if a user is not logged in
function isNotAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    next()
  } else {
    res.redirect('/myaccount')
  }
}

module.exports = router