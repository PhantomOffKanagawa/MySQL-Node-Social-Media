const express = require('express')
const router = express.Router()
const dbHelper = require('./dbHelper')
const passport = require('./passportHelper')
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
    'WITH PostLikes AS ( SELECT p.ID, COUNT(l.PostID) AS TotalLikes FROM POST p LEFT JOIN Likes l ON p.ID = l.PostID GROUP BY p.ID ), PostReplies AS ( SELECT r.OriginalPostID, COUNT(r.ReplyPostID) AS TotalReplies FROM Replies r GROUP BY r.OriginalPostID ), PostTags AS ( Select it.PostID, json_arrayagg(it.Tag) AS IncludedTags From IncludesTag it group by it.PostID ), PollVotes AS ( Select v.PostID, sum(if(Choice = 1, 1, 0)) as VotesFor1, sum(if(Choice = 2, 1, 0)) as VotesFor2 From Vote v group by v.PostID ) SELECT p.ID, p.Contents, p.CreatedTime, p.PosterUsername, p.ShortLinkID, pl.TotalLikes, pr.TotalReplies, r2.OriginalPostID, pt.IncludedTags, CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, u.OriginalURL, pl.Title, pl.Option1Text, pl.Option2Text, pv.VotesFor1, pv.VotesFor2, v.Choice as SecondUserChoice FROM POST p LEFT JOIN PostLikes pl ON p.ID = pl.ID LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = ? LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID LEFT JOIN PostTags pt ON p.ID = pt.PostID LEFT JOIN URLSHORTENER u ON p.ShortLinkID = u.ID LEFT JOIN POLL pl ON p.ID = pl.PostID LEFT JOIN PollVotes pv ON p.ID = pv.PostID LEFT JOIN Vote v ON p.ID = v.PostID and v.Username = ? WHERE p.PosterUsername = ?;', [req.session.passport.user, req.session.passport.user, req.session.passport.user],
    (err, rows) => {
      if (err) throw console.error(err)
      if (!err) {
        // console.log(typeof rows[0].ShortLinkURL);
        posts = rows;
      }
    });
  // dbHelper.mediaConnection.query('Select Tag From IncludesTag it Where it.PostID = ?')
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
  const username = (isAuthBool(req)) ? req.session.passport.user : null;
  dbHelper.mediaConnection.query(
    'WITH PostLikes AS ( SELECT p.ID, COUNT(l.PostID) AS TotalLikes FROM POST p LEFT JOIN Likes l ON p.ID = l.PostID GROUP BY p.ID ), PostReplies AS ( SELECT r.OriginalPostID, COUNT(r.ReplyPostID) AS TotalReplies FROM Replies r GROUP BY r.OriginalPostID ), PostTags AS ( Select it.PostID, json_arrayagg(it.Tag) AS IncludedTags From IncludesTag it group by it.PostID ), PollVotes AS ( Select v.PostID, sum(if(Choice = 1, 1, 0)) as VotesFor1, sum(if(Choice = 2, 1, 0)) as VotesFor2 From Vote v group by v.PostID ) SELECT p.ID, p.Contents, p.CreatedTime, p.PosterUsername, p.ShortLinkID, pl.TotalLikes, pr.TotalReplies, r2.OriginalPostID, pt.IncludedTags, CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, u.OriginalURL, pl.Title, pl.Option1Text, pl.Option2Text, pv.VotesFor1, pv.VotesFor2, v.Choice as SecondUserChoice FROM POST p LEFT JOIN PostLikes pl ON p.ID = pl.ID LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = ? LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID LEFT JOIN PostTags pt ON p.ID = pt.PostID LEFT JOIN URLSHORTENER u ON p.ShortLinkID = u.ID LEFT JOIN POLL pl ON p.ID = pl.PostID LEFT JOIN PollVotes pv ON p.ID = pv.PostID LEFT JOIN Vote v ON p.ID = v.PostID and v.Username = ? WHERE p.PosterUsername = ?;', [username, username, req.params.username],
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
          editable: (isAuthBool(req) && req.params.username == req.session.passport.user),
          posts: JSON.stringify(posts)
        })
      }
    }
  )
})

router.get('/viewpost/:postid', (req, res, next) => {
  console.log("The parameter is: " + req.params.postid);
  const username = (isAuthBool(req)) ? req.session.passport.user : null;
  dbHelper.mediaConnection.query(
    'WITH PostLikes AS ( SELECT p.ID, COUNT(l.PostID) AS TotalLikes FROM POST p LEFT JOIN Likes l ON p.ID = l.PostID GROUP BY p.ID ), PostReplies AS ( SELECT r.OriginalPostID, COUNT(r.ReplyPostID) AS TotalReplies FROM Replies r GROUP BY r.OriginalPostID ), PostTags AS ( Select it.PostID, json_arrayagg(it.Tag) AS IncludedTags From IncludesTag it group by it.PostID ), PollVotes AS ( Select v.PostID, sum(if(Choice = 1, 1, 0)) as VotesFor1, sum(if(Choice = 2, 1, 0)) as VotesFor2 From Vote v group by v.PostID ) SELECT p.ID, p.Contents, p.CreatedTime, p.PosterUsername, p.ShortLinkID, pl.TotalLikes, pr.TotalReplies, r2.OriginalPostID, pt.IncludedTags, CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, 1 AS ordering, u.OriginalURL, pl.Title, pl.Option1Text, pl.Option2Text, pv.VotesFor1, pv.VotesFor2, v.Choice as SecondUserChoice FROM POST p LEFT JOIN PostLikes pl ON p.ID = pl.ID LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = ? LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID LEFT JOIN PostTags pt ON p.ID = pt.PostID LEFT JOIN URLSHORTENER u ON p.ShortLinkID = u.ID LEFT JOIN POLL pl ON p.ID = pl.PostID LEFT JOIN PollVotes pv ON p.ID = pv.PostID LEFT JOIN Vote v ON p.ID = v.PostID and v.Username = ? WHERE p.ID = ? UNION ALL SELECT p.ID, p.Contents, p.CreatedTime, p.PosterUsername, p.ShortLinkID, pl.TotalLikes, pr.TotalReplies, r.OriginalPostID, pt.IncludedTags, CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, 2 AS ordering, u.OriginalURL, pl.Title, pl.Option1Text, pl.Option2Text, pv.VotesFor1, pv.VotesFor2, v.Choice as SecondUserChoice FROM POST p JOIN Replies r ON p.ID = r.ReplyPostID LEFT JOIN PostLikes pl ON p.ID = pl.ID LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = ? LEFT JOIN PostTags pt ON p.ID = pt.PostID LEFT JOIN URLSHORTENER u ON p.ShortLinkID = u.ID LEFT JOIN POLL pl ON p.ID = pl.PostID LEFT JOIN PollVotes pv ON p.ID = pv.PostID LEFT JOIN Vote v ON p.ID = v.PostID and v.Username = ? WHERE r.OriginalPostID = ? ORDER BY ordering, TotalLikes DESC;', [username, username, req.params.postid, username, username, req.params.postid],
    (err, rows) => {
      if (err) throw console.error(err)
      if (!err) {
        console.log(rows);
        console.log(rows[0].IncludedTags);
        // posts = rows;
        res.render('viewpost', {
          title: req.params.username + 'Post ' + req.body.postid,
          simpleIsLogged: isAuthBool(req),
          original: JSON.stringify(rows.shift()),
          rows: JSON.stringify(rows),
          editable: false,
          header: `Replies to Post`
        });
      }
    });
})

router.get('/tags/:tag', (req, res, next) => {
  // console.log("The parameter is: " + req.params.username);
  let posts;
  let tag = "#" + req.params.tag;
  const username = (isAuthBool(req)) ? req.session.passport.user : null;
  dbHelper.mediaConnection.query(
    'WITH PostLikes AS ( SELECT p.ID, COUNT(l.PostID) AS TotalLikes FROM POST p LEFT JOIN Likes l ON p.ID = l.PostID GROUP BY p.ID ), PostReplies AS ( SELECT r.OriginalPostID, COUNT(r.ReplyPostID) AS TotalReplies FROM Replies r GROUP BY r.OriginalPostID ), PostTags AS ( Select it.PostID, json_arrayagg(it.Tag) AS IncludedTags From IncludesTag it group by it.PostID ), PollVotes AS ( Select v.PostID, sum(if(Choice = 1, 1, 0)) as VotesFor1, sum(if(Choice = 2, 1, 0)) as VotesFor2 From Vote v group by v.PostID ) SELECT p.ID, p.Contents, p.CreatedTime, p.PosterUsername, p.ShortLinkID, pl.TotalLikes, pr.TotalReplies, r2.OriginalPostID, pt.IncludedTags, CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, u.OriginalURL, pl.Title, pl.Option1Text, pl.Option2Text, pv.VotesFor1, pv.VotesFor2, v.Choice as SecondUserChoice FROM POST p LEFT JOIN PostLikes pl ON p.ID = pl.ID LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = ? LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID LEFT JOIN PostTags pt ON p.ID = pt.PostID LEFT JOIN IncludesTag it ON p.ID = it.PostID LEFT JOIN URLSHORTENER u ON p.ShortLinkID = u.ID LEFT JOIN POLL pl ON p.ID = pl.PostID LEFT JOIN PollVotes pv ON p.ID = pv.PostID LEFT JOIN Vote v ON p.ID = v.PostID and v.Username = ? WHERE it.Tag = ? order by TotalLikes desc;', [username, username, tag],
    (err, rows) => {
      if (err) throw console.error(err)
      if (!err) {
        // console.log("hello");
        // console.log(JSON.stringify(rows));
        posts = rows;
        res.render('viewpost', {
          title: 'Top ' + tag + " posts",
          simpleIsLogged: isAuthBool(req),
          rows: JSON.stringify(rows),
          editable: false,
          header: `Most Liked ${tag} Posts`
        })
      }
    });
})

router.get('/trending', (req, res, next) => {
  let posts;
  dbHelper.getTrending(function (trending) {
    const username = (isAuthBool(req)) ? req.session.passport.user : null;
    dbHelper.mediaConnection.query(
      'WITH PostLikes AS ( SELECT p.ID, COUNT(l.PostID) AS TotalLikes FROM POST p LEFT JOIN Likes l ON p.ID = l.PostID GROUP BY p.ID ), PostReplies AS ( SELECT r.OriginalPostID, COUNT(r.ReplyPostID) AS TotalReplies FROM Replies r GROUP BY r.OriginalPostID ), PostTags AS ( Select it.PostID, json_arrayagg(it.Tag) AS IncludedTags From IncludesTag it group by it.PostID ), PollVotes AS ( Select v.PostID, sum(if(Choice = 1, 1, 0)) as VotesFor1, sum(if(Choice = 2, 1, 0)) as VotesFor2 From Vote v group by v.PostID ) SELECT p.ID, p.Contents, p.CreatedTime, p.PosterUsername, p.ShortLinkID, pl.TotalLikes, pr.TotalReplies, r2.OriginalPostID, pt.IncludedTags, CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, u.OriginalURL, pl.Title, pl.Option1Text, pl.Option2Text, pv.VotesFor1, pv.VotesFor2, v.Choice as SecondUserChoice FROM POST p LEFT JOIN PostLikes pl ON p.ID = pl.ID LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = ? LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID LEFT JOIN PostTags pt ON p.ID = pt.PostID LEFT JOIN IncludesTag it ON p.ID = it.PostID LEFT JOIN URLSHORTENER u ON p.ShortLinkID = u.ID LEFT JOIN POLL pl ON p.ID = pl.PostID LEFT JOIN PollVotes pv ON p.ID = pv.PostID LEFT JOIN Vote v ON p.ID = v.PostID and v.Username = ? WHERE it.Tag = ? order by TotalLikes desc;', [username, username, trending.Tag],
      (err, rows) => {
        if (err) throw console.error(err)
        if (!err) {
          if (rows.length == 0) {
            res.render('viewpost', {
              title: 'No tags used yet',
              simpleIsLogged: isAuthBool(req),
              editable: false,
              header: `No tags used yet`,
              secondary: ``
            })
            return;
          }
          posts = rows;
          res.render('viewpost', {
            title: 'The Trending Tag is ' + trending.Tag,
            simpleIsLogged: isAuthBool(req),
            rows: JSON.stringify(rows),
            editable: false,
            header: `${trending.Tag} is the top tag`,
            secondary: `Most Liked ${trending.Tag} Posts`
          })
        }
      });
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

// Page to Login
router.get('/shortenlink', isAuth, (req, res) => {
  res.render('linkShortener', {
    title: 'Link Shortener'
  })
})

router.get('/shortlink/:id', (req, res, next) => {
  console.log("The parameter is: " + req.params.id);
  dbHelper.getLink(req.params.id, function (url) {
    res.send(
      '<h1>You are about to leave the site... </h1><p><a href="' + url + '">' + url + '</a></p>'
    );
  })
});

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

router.post('/linkremove', isAuth, (req, res, next) => {
  dbHelper.removeLink(req.session.passport.user, req.body.link);

  res.redirect('/myaccount');
});

router.post('/newpost', isAuth, (req, res, next) => {
  const PollObject = (req.body.pollName == "") ? null : {Title: req.body.pollName, Option1Text: req.body.option1, Option2Text: req.body.option2}
  dbHelper.newPost(req.body.contents, new Date().toISOString(), req.session.passport.user, req.body.longLink, null, PollObject);

  res.redirect('/myaccount');
});

router.post('/replypost', isAuth, (req, res, next) => {
  console.log("The old id was: " + req.body.postID)
  const PollObject = (req.body.pollName == "") ? null : {Title: req.body.pollName, Option1Text: req.body.option1, Option2Text: req.body.option2}
  dbHelper.newPost(req.body.contents, new Date().toISOString(), req.session.passport.user, req.body.longLink, req.body.originalPostID, PollObject);

  res.redirect('/myaccount');
});

router.post('/getuser', (req, res, next) => {
  res.redirect('/account/' + req.body.user)
});

//! Optionally add check for already liked for resiliance
router.post('/likepost', isAuth, (req, res, next) => {
  // console.log(req.session.passport.user, req.body.postID, req.body.liked);
  dbHelper.likePost(req.session.passport.user, req.body.postID, req.body.liked);

  // res.redirect('/myaccount');
});

router.post('/votefor', isAuth, (req, res, next) => {
  console.log(req.session.passport.user, req.body.postID, req.body.choice);
  dbHelper.voteFor(req.session.passport.user, req.body.postID, req.body.choice);
});

router.post('/shortenlink', isAuth, (req, res, next) => {
  dbHelper.shortenLink(req.body.longLink, function (id) {
    res.render('linkShortener', {
      title: "URL Shortener",
      longLink: req.body.longLink,
      shortLink: ("localhost:3000/shortlink/" + id)
    })
  })

})

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