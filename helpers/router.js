const express = require('express')
const router = express.Router()
const dbHelper = require('./dbHelper')
const passport = require('./passportHelper')
const crypto = require('crypto')

router.use(passport.initialize())
router.use(passport.session())

// GET Routes

// Landing Page
router.get('/', (req, res) => {
  res.render('index.ejs', {
    title: 'Home',
    simpleIsLogged: isAuthBool(req)
  })
})

// Login Page
router.get('/login', isNotAuth, (req, res) => {
  res.render('login', {
    title: 'Login'
  })
})

// Logout Address, Redirects to Landing
router.get('/logout', (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    res.redirect('/')
  })
})

// Get's Your Account and Shows Account Information and All User Posts
router.get('/myaccount', isAuth, (req, res, next) => {
  let posts;
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
    'SELECT USER.Username, b.Birthday, d.Description, l.Location, el.Link FROM USER LEFT JOIN Birthday b ON USER.Username = b.Username LEFT JOIN Description d ON USER.Username = d.Username LEFT JOIN Location l ON USER.Username = l.Username LEFT JOIN ExternalLinks el ON USER.Username = el.Username WHERE USER.Username = ?', req.session.passport.user,
    (err, rows) => {
      if (err) throw console.error(err)
      if (!err) {
        // Render the account ejs with my account name
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

// Get user information for other account, very similar to /myaccount
router.get('/account/:username', (req, res, next) => {
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
    'SELECT USER.Username, b.Birthday, d.Description, l.Location, el.Link FROM USER LEFT JOIN Birthday b ON USER.Username = b.Username LEFT JOIN Description d ON USER.Username = d.Username LEFT JOIN Location l ON USER.Username = l.Username LEFT JOIN ExternalLinks el ON USER.Username = el.Username WHERE USER.Username = ?', req.params.username,
    (err, rows) => {
      // Checks if user exists
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

// Page to view a post and all replies to post sorted by likes
router.get('/viewpost/:postid', (req, res, next) => {
  console.log("The parameter is: " + req.params.postid);
  // Resiliant username variable in case user not auth
  const username = (isAuthBool(req)) ? req.session.passport.user : null;
  dbHelper.mediaConnection.query(
    'WITH PostLikes AS ( SELECT p.ID, COUNT(l.PostID) AS TotalLikes FROM POST p LEFT JOIN Likes l ON p.ID = l.PostID GROUP BY p.ID ), PostReplies AS ( SELECT r.OriginalPostID, COUNT(r.ReplyPostID) AS TotalReplies FROM Replies r GROUP BY r.OriginalPostID ), PostTags AS ( Select it.PostID, json_arrayagg(it.Tag) AS IncludedTags From IncludesTag it group by it.PostID ), PollVotes AS ( Select v.PostID, sum(if(Choice = 1, 1, 0)) as VotesFor1, sum(if(Choice = 2, 1, 0)) as VotesFor2 From Vote v group by v.PostID ) SELECT p.ID, p.Contents, p.CreatedTime, p.PosterUsername, p.ShortLinkID, pl.TotalLikes, pr.TotalReplies, r2.OriginalPostID, pt.IncludedTags, CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, 1 AS ordering, u.OriginalURL, pl.Title, pl.Option1Text, pl.Option2Text, pv.VotesFor1, pv.VotesFor2, v.Choice as SecondUserChoice FROM POST p LEFT JOIN PostLikes pl ON p.ID = pl.ID LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = ? LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID LEFT JOIN PostTags pt ON p.ID = pt.PostID LEFT JOIN URLSHORTENER u ON p.ShortLinkID = u.ID LEFT JOIN POLL pl ON p.ID = pl.PostID LEFT JOIN PollVotes pv ON p.ID = pv.PostID LEFT JOIN Vote v ON p.ID = v.PostID and v.Username = ? WHERE p.ID = ? UNION ALL SELECT p.ID, p.Contents, p.CreatedTime, p.PosterUsername, p.ShortLinkID, pl.TotalLikes, pr.TotalReplies, r.OriginalPostID, pt.IncludedTags, CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, 2 AS ordering, u.OriginalURL, pl.Title, pl.Option1Text, pl.Option2Text, pv.VotesFor1, pv.VotesFor2, v.Choice as SecondUserChoice FROM POST p JOIN Replies r ON p.ID = r.ReplyPostID LEFT JOIN PostLikes pl ON p.ID = pl.ID LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = ? LEFT JOIN PostTags pt ON p.ID = pt.PostID LEFT JOIN URLSHORTENER u ON p.ShortLinkID = u.ID LEFT JOIN POLL pl ON p.ID = pl.PostID LEFT JOIN PollVotes pv ON p.ID = pv.PostID LEFT JOIN Vote v ON p.ID = v.PostID and v.Username = ? WHERE r.OriginalPostID = ? ORDER BY ordering, TotalLikes DESC;', [username, username, req.params.postid, username, username, req.params.postid],
    (err, rows) => {
      if (err) throw console.error(err)
      if (!err) {
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

// Page to get posts by tag
router.get('/tags/:tag', (req, res, next) => {
  let tag = "#" + req.params.tag;
  // Resiliant username variable in case user not auth
  const username = (isAuthBool(req)) ? req.session.passport.user : null;
  dbHelper.mediaConnection.query(
    'WITH PostLikes AS ( SELECT p.ID, COUNT(l.PostID) AS TotalLikes FROM POST p LEFT JOIN Likes l ON p.ID = l.PostID GROUP BY p.ID ), PostReplies AS ( SELECT r.OriginalPostID, COUNT(r.ReplyPostID) AS TotalReplies FROM Replies r GROUP BY r.OriginalPostID ), PostTags AS ( Select it.PostID, json_arrayagg(it.Tag) AS IncludedTags From IncludesTag it group by it.PostID ), PollVotes AS ( Select v.PostID, sum(if(Choice = 1, 1, 0)) as VotesFor1, sum(if(Choice = 2, 1, 0)) as VotesFor2 From Vote v group by v.PostID ) SELECT p.ID, p.Contents, p.CreatedTime, p.PosterUsername, p.ShortLinkID, pl.TotalLikes, pr.TotalReplies, r2.OriginalPostID, pt.IncludedTags, CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, u.OriginalURL, pl.Title, pl.Option1Text, pl.Option2Text, pv.VotesFor1, pv.VotesFor2, v.Choice as SecondUserChoice FROM POST p LEFT JOIN PostLikes pl ON p.ID = pl.ID LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = ? LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID LEFT JOIN PostTags pt ON p.ID = pt.PostID LEFT JOIN IncludesTag it ON p.ID = it.PostID LEFT JOIN URLSHORTENER u ON p.ShortLinkID = u.ID LEFT JOIN POLL pl ON p.ID = pl.PostID LEFT JOIN PollVotes pv ON p.ID = pv.PostID LEFT JOIN Vote v ON p.ID = v.PostID and v.Username = ? WHERE it.Tag = ? order by TotalLikes desc;', [username, username, tag],
    (err, rows) => {
      if (err) throw console.error(err)
      if (!err) {
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

// Page to get posts by trending tag, similar to /tags/
router.get('/trending', (req, res, next) => {
  dbHelper.getTrending(function (trending) {
    // Resiliant username variable in case user not auth
    const username = (isAuthBool(req)) ? req.session.passport.user : null;
    dbHelper.mediaConnection.query(
      'WITH PostLikes AS ( SELECT p.ID, COUNT(l.PostID) AS TotalLikes FROM POST p LEFT JOIN Likes l ON p.ID = l.PostID GROUP BY p.ID ), PostReplies AS ( SELECT r.OriginalPostID, COUNT(r.ReplyPostID) AS TotalReplies FROM Replies r GROUP BY r.OriginalPostID ), PostTags AS ( Select it.PostID, json_arrayagg(it.Tag) AS IncludedTags From IncludesTag it group by it.PostID ), PollVotes AS ( Select v.PostID, sum(if(Choice = 1, 1, 0)) as VotesFor1, sum(if(Choice = 2, 1, 0)) as VotesFor2 From Vote v group by v.PostID ) SELECT p.ID, p.Contents, p.CreatedTime, p.PosterUsername, p.ShortLinkID, pl.TotalLikes, pr.TotalReplies, r2.OriginalPostID, pt.IncludedTags, CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, u.OriginalURL, pl.Title, pl.Option1Text, pl.Option2Text, pv.VotesFor1, pv.VotesFor2, v.Choice as SecondUserChoice FROM POST p LEFT JOIN PostLikes pl ON p.ID = pl.ID LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = ? LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID LEFT JOIN PostTags pt ON p.ID = pt.PostID LEFT JOIN IncludesTag it ON p.ID = it.PostID LEFT JOIN URLSHORTENER u ON p.ShortLinkID = u.ID LEFT JOIN POLL pl ON p.ID = pl.PostID LEFT JOIN PollVotes pv ON p.ID = pv.PostID LEFT JOIN Vote v ON p.ID = v.PostID and v.Username = ? WHERE it.Tag = ? order by TotalLikes desc;', [username, username, trending.Tag],
      (err, rows) => {
        if (err) throw console.error(err)
        if (!err) {
          // If no posts with tags show warning
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

// Page for shortening links
router.get('/shortenlink', isAuth, (req, res) => {
  res.render('linkShortener', {
    title: 'Link Shortener'
  })
})

// Page to redirect from shortened link to page with full link
router.get('/shortlink/:id', (req, res, next) => {
  console.log("The parameter is: " + req.params.id);
  dbHelper.getLink(req.params.id, function (url) {
    res.send(
      '<h1>You are about to leave the site... </h1><p><a href="' + url + '">' + url + '</a></p>'
    );
  })
});


// POST Routes

// Handle registration
router.post('/register', userExists, (req, res, next) => {
  // Generate encrypted password hash and salt
  const saltHash = genPassword(req.body.password)

  // Insert the user
  dbHelper.insertUser(
    req.body.username,
    new Date().toISOString(),
    saltHash.hash,
    saltHash.salt
  )

  // Go to login
  res.redirect('/login')
})

// Handle login authentication if valid go to my account, else to failed page
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/myaccount',
    failureRedirect: '/login-failed'
  })
)

// Handle edits to account
router.post('/myaccount', isAuth, (req, res, next) => {
  const birthday = req.body.birthday;
  const location = req.body.location;
  const description = req.body.description;
  const username = req.session.passport.user;

  dbHelper.updateUser(username, birthday, description, location);

  res.redirect('/myaccount');
})

// Handle new link from myaccount page
router.post('/linkadd', isAuth, (req, res, next) => {
  if (req.body.link == "") return res.redirect('/myaccount');
  dbHelper.addLink(req.session.passport.user, req.body.link);

  res.redirect('/myaccount');
});

// Handle removing link from myaccount page
router.post('/linkremove', isAuth, (req, res, next) => {
  dbHelper.removeLink(req.session.passport.user, req.body.link);

  res.redirect('/myaccount');
});

// Handle new post from user
router.post('/newpost', isAuth, (req, res, next) => {
  const PollObject = (req.body.pollName == "") ? null : {Title: req.body.pollName, Option1Text: req.body.option1, Option2Text: req.body.option2}
  dbHelper.newPost(req.body.contents, new Date().toISOString(), req.session.passport.user, req.body.longLink, null, PollObject);

  res.redirect('/myaccount');
});

// Handle new post that is reply
router.post('/replypost', isAuth, (req, res, next) => {
  console.log("The old id was: " + req.body.postID)
  const PollObject = (req.body.pollName == "") ? null : {Title: req.body.pollName, Option1Text: req.body.option1, Option2Text: req.body.option2}
  dbHelper.newPost(req.body.contents, new Date().toISOString(), req.session.passport.user, req.body.longLink, req.body.originalPostID, PollObject);

  res.redirect('/myaccount');
});

// Handle searchbar user
router.post('/getuser', (req, res, next) => {
  res.redirect('/account/' + req.body.user)
});

// Handle likes
router.post('/likepost', isAuth, (req, res, next) => {
  dbHelper.likePost(req.session.passport.user, req.body.postID, req.body.liked);
});

// Handle votes
router.post('/votefor', isAuth, (req, res, next) => {
  console.log(req.session.passport.user, req.body.postID, req.body.choice);
  dbHelper.voteFor(req.session.passport.user, req.body.postID, req.body.choice);
});

// Handle link shorten request from link shorten page
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
    res.redirect('/notAuthorized')
  }
}

// Helper to check if a user is not logged in for express
function isNotAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    next()
  } else {
    res.redirect('/myaccount')
  }
}

// Helper to check if a user is logged in for functions
function isAuthBool(req) {
  return req.isAuthenticated();
}

module.exports = router