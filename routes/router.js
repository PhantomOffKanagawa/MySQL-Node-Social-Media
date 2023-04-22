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
    title: 'Home',
    simpleIsLogged: isAuthBool(req)
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
  let posts;
  dbHelper.mediaConnection.query(
    'SELECT ID, Contents, CreatedTime, PosterUsername, ShortlinkID, CASE WHEN l.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, COUNT(DISTINCT l2.PostID) AS TotalLikes, COUNT(DISTINCT r.ReplyPostID) AS TotalReplies, MAX(r2.OriginalPostID) AS OriginalPostID FROM POST p LEFT JOIN Likes l ON p.ID = l.PostID AND l.Username = ? LEFT JOIN Likes l2 ON p.ID = l2.PostID LEFT JOIN Replies r ON p.ID = r.OriginalPostID LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID WHERE p.PosterUsername = ? GROUP BY p.ID;', [req.session.passport.user,req.session.passport.user],
    (err, rows) => {
      if (err) throw console.error(err)
      if (!err) {
        // console.log(JSON.stringify(rows));
        posts = rows;
      }
    });
  dbHelper.mediaConnection.query(
    'SELECT USER.Username, Birthday, Description, Location, ExternalLinks.Link FROM USER LEFT JOIN ExternalLinks ON USER.Username = ExternalLinks.Username WHERE USER.Username = ?', req.session.passport.user,
    (err, rows) => {
      if (err) throw console.error(err)
      if (!err) {
        // console.log(rows)
        res.render('account', {
          title: 'My Account',
          simpleIsLogged: isAuthBool(req),
          rows: JSON.stringify(rows),
          user: JSON.stringify(rows[0]),
          username: rows[0].Username,
          editable: true,
          posts: JSON.stringify(posts)
        })
      }
    }
  )
})

router.get('/account/:username', (req, res, next) => {
  // console.log("The parameter is: " + req.params.username);
  let posts;
  dbHelper.mediaConnection.query(
    'SELECT ID, Contents, CreatedTime, PosterUsername, ShortlinkID, CASE WHEN l.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, COUNT(DISTINCT l2.PostID) AS TotalLikes, COUNT(DISTINCT r.ReplyPostID) AS TotalReplies, MAX(r2.OriginalPostID) AS OriginalPostID FROM POST p LEFT JOIN Likes l ON p.ID = l.PostID AND l.Username = ? LEFT JOIN Likes l2 ON p.ID = l2.PostID LEFT JOIN Replies r ON p.ID = r.OriginalPostID LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID WHERE p.PosterUsername = ? GROUP BY p.ID;', [req.session.passport.user,req.params.username],
    (err, rows) => {
      if (err) throw console.error(err)
      if (!err) {
        // console.log("hello");
        // console.log(JSON.stringify(rows));
        posts = rows;
      }
    });
  dbHelper.mediaConnection.query(
    'SELECT USER.Username, Birthday, Description, Location, ExternalLinks.Link FROM USER LEFT JOIN ExternalLinks ON USER.Username = ExternalLinks.Username WHERE USER.Username = ?', req.params.username,
    (err, rows) => {
      if (err) {
        console.error(err)
        res.send("Username not found")
      } else if (rows.length == 0) {
        res.send("Username not found")
      } else {
        res.render('account', {
          title: req.params.username + '\'s Account',
          simpleIsLogged: isAuthBool(req),
          rows: JSON.stringify(rows),
          user: JSON.stringify(rows[0]),
          username: rows[0].Username,
          editable: ( isAuthBool(req) && req.params.username == req.session.passport.user),
          posts: JSON.stringify(posts)
        })
      }
    }
  )
})

router.get('/viewpost/:postid', (req, res, next) => {
  console.log("The parameter is: " + req.params.postid);
  dbHelper.mediaConnection.query(
    'WITH PostLikes AS ( SELECT p.ID, COUNT(l.PostID) AS TotalLikes FROM POST p LEFT JOIN Likes l ON p.ID = l.PostID GROUP BY p.ID ), PostReplies AS ( SELECT r.OriginalPostID, COUNT(r.ReplyPostID) AS TotalReplies FROM Replies r GROUP BY r.OriginalPostID ) SELECT p.*, pl.TotalLikes, pr.TotalReplies, r2.OriginalPostID, CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser FROM POST p LEFT JOIN PostLikes pl ON p.ID = pl.ID LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = ? LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID WHERE p.ID = ? UNION ALL SELECT p.*, pl.TotalLikes, pr.TotalReplies, r.OriginalPostID, CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser FROM POST p JOIN Replies r ON p.ID = r.ReplyPostID LEFT JOIN PostLikes pl ON p.ID = pl.ID LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = ? WHERE r.OriginalPostID = ? ORDER BY TotalLikes DESC;', [req.session.passport.user, req.params.postid, req.session.passport.user, req.params.postid],
    (err, rows) => {
      if (err) throw console.error(err)
      if (!err) {
        // console.log("hello");
        // console.log(rows.shift());
        // posts = rows;
        res.render('viewpost', {
          title: req.params.username + 'Post ' + req.body.postid,
          simpleIsLogged: isAuthBool(req),
          original: JSON.stringify(rows.shift()),
          rows: JSON.stringify(rows),
          editable: ( isAuthBool(req) && req.params.username == req.session.passport.user)
        });
      }
    });
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
  if (req.body.link == "") return res.redirect('/myaccount');
  dbHelper.addLink(req.session.passport.user, req.body.link);

  res.redirect('/myaccount');
});

router.post('/linkremove', (req, res, next) => {
  dbHelper.removeLink(req.session.passport.user, req.body.link);

  res.redirect('/myaccount');
});

router.post('/newpost', (req, res, next) => {
  dbHelper.newPost(req.body.contents, new Date().toISOString(), req.session.passport.user);

  res.redirect('/myaccount');
});

router.post('/replypost', (req, res, next) => {
  console.log("The old id was: " + req.body.postID)
  dbHelper.replyPost(req.body.contents, new Date().toISOString(), req.session.passport.user, undefined, req.body.postID);

  res.redirect('/myaccount');
});

//! Optionally add check for already liked for resiliance
router.post('/likepost', (req, res, next) => {
  // console.log(req.session.passport.user, req.body.postID, req.body.liked);
  dbHelper.likePost(req.session.passport.user, req.body.postID, req.body.liked);

  // res.redirect('/myaccount');
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

function isAuthBool(req) {
  return req.isAuthenticated();
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