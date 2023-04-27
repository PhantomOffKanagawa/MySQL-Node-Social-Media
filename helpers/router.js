const express = require('express')
const router = express.Router()
const dbHelper = require('./dbHelper')
const passport = require('./passportHelper')
const crypto = require('crypto')

router.use(passport.initialize())
router.use(passport.session())

// GET Routes

// Logout Address, Redirects to Landing
router.get('/api/logout', (req, res) => {
  console.log("logout");
  req.logout(function (err) {
    if (err) {
      console.log("err")
      return next(err)
    }
    res.json({ msg: "Logged Out"})
  })
})

// Get's Your Account and Shows Account Information and All User Posts
router.get('/api/myaccount', isAuth, (req, res, next) => {
  let posts;
  console.log("myaccount get")
  // Gets all posts by user, explained in Queries
  dbHelper.mediaConnection.query(
    'WITH PostLikes AS ( SELECT p.ID, COUNT(l.PostID) AS TotalLikes FROM POST p LEFT JOIN Likes l ON p.ID = l.PostID GROUP BY p.ID ), PostReplies AS ( SELECT r.OriginalPostID, COUNT(r.ReplyPostID) AS TotalReplies FROM Replies r GROUP BY r.OriginalPostID ), PostTags AS ( Select it.PostID, json_arrayagg(it.Tag) AS IncludedTags From IncludesTag it group by it.PostID ), PollVotes AS ( Select v.PostID, sum(if(Choice = 1, 1, 0)) as VotesFor1, sum(if(Choice = 2, 1, 0)) as VotesFor2 From Vote v group by v.PostID ) SELECT p.ID, p.Contents, p.CreatedTime, p.PosterUsername, p.ShortLinkID, pl.TotalLikes, pr.TotalReplies, r2.OriginalPostID, pt.IncludedTags, CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, u.OriginalURL, pl.Title, pl.Option1Text, pl.Option2Text, pv.VotesFor1, pv.VotesFor2, v.Choice as SecondUserChoice FROM POST p LEFT JOIN PostLikes pl ON p.ID = pl.ID LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = ? LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID LEFT JOIN PostTags pt ON p.ID = pt.PostID LEFT JOIN URLSHORTENER u ON p.ShortLinkID = u.ID LEFT JOIN POLL pl ON p.ID = pl.PostID LEFT JOIN PollVotes pv ON p.ID = pv.PostID LEFT JOIN Vote v ON p.ID = v.PostID and v.Username = ? WHERE p.PosterUsername = ?;', [req.session.passport.user, req.session.passport.user, req.session.passport.user],
    (err, rows) => {
      if (err) throw console.error(err)
      if (!err) {
        posts = rows;
      }
    });
  // get relvent user information including external links
  dbHelper.mediaConnection.query(
    'SELECT USER.Username, Birthday, Description, Location, ExternalLinks.Link FROM USER LEFT JOIN ExternalLinks ON USER.Username = ExternalLinks.Username WHERE USER.Username = ?', req.session.passport.user,
    (err, rows) => {
      if (err) throw console.error(err)
      if (!err) {
        console.log(rows[0])
        res.json({user: rows[0], posts: posts.reverse(), simpleIsLogged: isAuthBool(req)})
      }
    }
  )
})

// Get user information for other account, very similar to /myaccount
router.get('/api/account/:username', (req, res, next) => {
  let posts;
  // Resiliant username variable in case user not auth
  const username = (isAuthBool(req)) ? req.session.passport.user : null;
  dbHelper.mediaConnection.query(
    'WITH PostLikes AS ( SELECT p.ID, COUNT(l.PostID) AS TotalLikes FROM POST p LEFT JOIN Likes l ON p.ID = l.PostID GROUP BY p.ID ), PostReplies AS ( SELECT r.OriginalPostID, COUNT(r.ReplyPostID) AS TotalReplies FROM Replies r GROUP BY r.OriginalPostID ), PostTags AS ( Select it.PostID, json_arrayagg(it.Tag) AS IncludedTags From IncludesTag it group by it.PostID ), PollVotes AS ( Select v.PostID, sum(if(Choice = 1, 1, 0)) as VotesFor1, sum(if(Choice = 2, 1, 0)) as VotesFor2 From Vote v group by v.PostID ) SELECT p.ID, p.Contents, p.CreatedTime, p.PosterUsername, p.ShortLinkID, pl.TotalLikes, pr.TotalReplies, r2.OriginalPostID, pt.IncludedTags, CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, u.OriginalURL, pl.Title, pl.Option1Text, pl.Option2Text, pv.VotesFor1, pv.VotesFor2, v.Choice as SecondUserChoice FROM POST p LEFT JOIN PostLikes pl ON p.ID = pl.ID LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = ? LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID LEFT JOIN PostTags pt ON p.ID = pt.PostID LEFT JOIN URLSHORTENER u ON p.ShortLinkID = u.ID LEFT JOIN POLL pl ON p.ID = pl.PostID LEFT JOIN PollVotes pv ON p.ID = pv.PostID LEFT JOIN Vote v ON p.ID = v.PostID and v.Username = ? WHERE p.PosterUsername = ?;', [username, username, req.params.username],
    (err, rows) => {
      if (err) throw console.error(err)
      if (!err) {
        posts = rows;
      }
    });
  dbHelper.mediaConnection.query(
    'SELECT USER.Username, Birthday, Description, Location, ExternalLinks.Link FROM USER LEFT JOIN ExternalLinks ON USER.Username = ExternalLinks.Username WHERE USER.Username = ?', req.params.username,
    (err, rows) => {
      // Checks if user exists
      if (err) {
        console.error(err)
        res.send("Username not found")
      } else if (rows.length == 0) {
        res.send("Username not found")
      } else {
        console.log(rows[0])
        res.json({user: rows[0], posts: posts.reverse(), simpleIsLogged: isAuthBool(req)})
      }
    }
  )
})

router.get('/api/accounts', (req, res, next) => {
  dbHelper.mediaConnection.query('SELECT USER.Username, COUNT(Likes.PostID) AS TotalLikes FROM USER LEFT JOIN POST ON USER.Username = POST.PosterUsername LEFT JOIN Likes ON POST.ID = Likes.PostID GROUP BY USER.Username ORDER BY TotalLikes DESC;', 
  (err, result) => {
    if (err) console.log(err);
    else {
      res.json({simpleIsLogged: isAuthBool(req), accounts: result});
    }
  })
});


// POST Routes

// Handle registration
router.post('/api/register', userExists, (req, res, next) => {
  console.log("Register Received with: " + JSON.stringify(req.body));
  // res.status(400).json({ error: 'Unable to add this book' })
  // Generate encrypted password hash and salt
  const saltHash = genPassword(req.body.password)

  // Insert the user
  dbHelper.insertUser(
    req.body.username,
    new Date().toISOString(),
    null,
    null,
    null,
    saltHash.hash,
    saltHash.salt
  )

  // Go to login
  res.json({ msg: 'Register was successful' })
})

// Handle login authentication if valid go to my account, else to failed page
router.post(
  '/api/login',
  passport.authenticate('local', {
    successRedirect: '/api/myaccount',
    failureRedirect: '/api/login-failed'
  })
)

// Handle edits to account
router.post('/api/myaccount', isAuth, (req, res, next) => {
  const birthday = req.body.birthday;
  const location = req.body.location;
  const description = req.body.description;
  const username = req.session.passport.user;

  dbHelper.updateUser(username, birthday, description, location);

  res.redirect('/api/myaccount');
})

// Handle new post from user
router.post('/api/newpost', isAuth, (req, res, next) => {
  dbHelper.newPost(req.body.contents, new Date().toISOString(), req.session.passport.user);

  res.redirect('/api/myaccount');
});

// Handle searchbar user
router.post('/api/getuser', (req, res, next) => {
  res.redirect('/account/' + req.body.user)
});

// Handle likes
router.post('/api/likepost', isAuth, (req, res, next) => {
  console.log("liked")
  dbHelper.likePost(req.session.passport.user, req.body.postID, req.body.liked);
  res.json({ msg: "All Good"})
});

// Helpers

// Helper to check if a username is already in use
function userExists(req, res, next) {
  dbHelper.mediaConnection.query(
    'Select * from USER where Username=? ',
    [req.body.username],
    function (error, results, fields) {
      if (error) {
        console.log(error)
      } else if (results.length > 0) {
        res.status(400).json({ msg: "User already exists" });
      } else {
        next()
      }
    }
  )
}

// Helper to generate encrypted passwords
function genPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex'),
    genhash = crypto
    .pbkdf2Sync(password, salt, 10000, 60, 'sha512')
    .toString('hex')
  return {
    salt: salt,
    hash: genhash
  }
}

// Helper to check if a user is logged in for express
function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.status(400).json({ msg: "User not authorized" });
  }
}

// Helper to check if a user is not logged in for express
function isNotAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    next()
  } else {
    res.status(400).json({ msg: "User already authorized" });
  }
}

// Helper to check if a user is logged in for functions
function isAuthBool(req) {
  return req.isAuthenticated();
}

module.exports = router