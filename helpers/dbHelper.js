const mysql2 = require('mysql2')
require('dotenv').config()

// Variable holding the mysql2 connection
const mediaConnection = mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

// Function for inserting new user
function insertUser (username, createdTime, hash, salt) {
  mediaConnection.query(
    'INSERT INTO USER SET ?',
    {
      Username: username,
      CreatedTime: createdTime,
      Hash: hash,
      Salt: salt
    },
    function (err, result) {
      if (err) console.log(err)
    }
  )
}

// Function to remove a user (Never Used)
function removeUser (username) {
  mediaConnection.query(
    'DELETE FROM USER WHERE Username = ?',
    [username],
    function (err, result) {
      if (err) console.log(err.message)
      console.log('Result: ' + JSON.stringify(result[0]))
    }
  )
}

// Function to change a user's details, used by edit
function updateUser (username, birthday, description, location) {
  if (birthday != '')
    mediaConnection.query(
      'Replace into Birthday SET ?',
      { Username: username, Birthday: birthday },
      function (err, result) {
        if (err) console.log(err.message)
        return true
      }
    )

  if (description != '')
    mediaConnection.query(
      'Replace into Description SET ?',
      { Username: username, Description: description },
      function (err, result) {
        if (err) console.log(err.message)
        return true
      }
    )

  if (location != '')
    mediaConnection.query(
      'Replace into Location SET ?',
      { Username: username, Location: location },
      function (err, result) {
        if (err) console.log(err.message)
        return true
      }
    )
}

// Function to attach a ExternalLink to a user
function addLink (username, linkStr) {
  const link = {
    Username: username,
    Link: linkStr
  }
  mediaConnection.query(
    'INSERT INTO ExternalLinks SET ?',
    link,
    function (err, result) {
      if (err) console.log(err)
    }
  )
}

// Function to remove a ExternalLink from a user
function removeLink (username, linkStr) {
  mediaConnection.query(
    'DELETE FROM ExternalLinks WHERE Link = ? and Username = ?',
    [linkStr, username],
    function (err, result) {
      if (err) console.log(err.message)
    }
  )
}

// Helper function for newPost to increase readability
function addReply (originalID, newID) {
  mediaConnection.query(
    'INSERT INTO Replies SET ?',
    {
      ReplyPostID: newID,
      OriginalPostID: originalID
    },
    function (err, result) {
      if (err) console.log(err)
    }
  )
}

// Function that handles all possible aspects of a newPost
function newPost (
  contents,
  createdTime,
  posterUsername,
  longLink,
  originalID,
  PollObject
) {
  // Shorten the passed link, passes null back if null was passed
  shortenLink(longLink, function (id) {
    // Insert the post
    mediaConnection.query(
      'INSERT INTO POST SET ?',
      {
        Contents: contents,
        CreatedTime: createdTime,
        PosterUsername: posterUsername,
        ShortLinkID: id
      },
      function (err, result) {
        if (err) console.log(err)
        else {
          // Store the ID of the created Post
          const newID = result.insertId

          // If a reply add reply connection
          if (originalID != null) addReply(originalID, newID)

          // Check for and add hashtags
          const m = contents.match(/(?<=^| )#(\S){1,20}(?= |$|\n)/g),
            match = m == null ? [] : Array.from(new Set(m))
          if (match.length != 0)
            match.forEach(tag => {
              newHashtag(tag.toLowerCase(), function (tag) {
                includeHashtag(tag.toLowerCase(), newID)
              })
            })

          // If poll was passed, write poll
          if (PollObject != null) {
            PollObject.PostID = newID
            createPoll(PollObject, function () {})
          }
        }
      }
    )
  })
}

// Function to insert a hashtag
function newHashtag (Tag, callback) {
  mediaConnection.query(
    'INSERT INTO Hashtag SET ?',
    {
      Tag: Tag
    },
    function (err, result) {
      // If error not the expected possible duplicate then log
      if (err && err.code != 'ER_DUP_ENTRY') console.log(err)
      else {
        // Send back added tag
        callback(Tag)
        return true
      }
    }
  )
}

// Function to attach a hashtag to a post
function includeHashtag (Tag, PostID) {
  mediaConnection.query(
    'INSERT INTO IncludesTag SET ?',
    {
      PostID: PostID,
      Tag: Tag
    },
    function (err, result) {
      if (err) console.log(err)
    }
  )
}

// Function to write a like of a post
function likePost (likerUsername, likedPostId, liked) {
  // If not currently liked, insert like
  if (liked == 'false') {
    mediaConnection.query(
      'INSERT INTO Likes SET ?',
      {
        Username: likerUsername,
        PostID: likedPostId
      },
      function (err, result) {
        if (err) console.log(err)
      }
    )

    // If currently liked, remove like
  } else {
    mediaConnection.query(
      'DELETE FROM Likes Where Username = ? and PostID = ?',
      [likerUsername, likedPostId],
      function (err, result) {
        if (err) console.log(err)
      }
    )
  }
}

// Helper function to update trending if its lifespan has passed
function updateTrending (lifespan, callback) {
  // Gets the top used tag where the created time of the post is more recent then the StartTime of the last trending to get 'new' posts
  mediaConnection.query(
    'with TagUses as ( select it.Tag, count(it.PostID) as UsedCount from IncludesTag it left join post p on p.ID = it.PostID where CreatedTime > (select StartTime from trending order by StartTime desc limit 1) group by it.Tag ) select h.Tag, usedCount from Hashtag h left join TagUses tu on h.Tag = tu.Tag order by tu.UsedCount desc limit 1;',
    function (err, result) {
      if (err) console.log('Error in update Trending ' + err)

      // If no new used posts callback to getTrending
      if (result.length == 0) callback(false)
      else {
        // Else insert a new trending tuple with the new info
        mediaConnection.query(
          'insert into Trending set ?',
          {
            StartTime: new Date().toISOString(),
            Tag: result[0].usedCount != null ? result[0].Tag : null,
            Lifespan: lifespan
          },
          (err, result) => {
            if (err) console.log('Error in update Trending ' + err)
            callback(true)
          }
        )
      }
    }
  )
}

// Handle getting the trending tag for the /trending page, if no new tags found it falls back to the last trending one
function getTrending (callback) {
  let trending
  // Get the top trending tag from trending memory, where the tag isn't null
  mediaConnection.query(
    'select * from trending t where Tag<>"null" order by StartTime desc limit 1',
    (err, result) => {
      if (err) console.error(err)
      else {
        trending = result[0]
        // If there isn't an occurence like this insert math helper trending and update the trending
        if (typeof trending == 'undefined') {
          mediaConnection.query(
            'insert into Trending set ?',
            {
              StartTime: 0,
              Tag: null,
              Lifespan: 0
            },
            (err, result) => {
              updateTrending(60000, function (hadTag) {
                // If updateTrending found there was no new tag, callback with nothing
                if (!hadTag) callback([])
                // If updateTrending found there was a new tag, get it from trending and callback with that tag
                else {
                  mediaConnection.query(
                    'select * from trending t where Tag<>"null" order by StartTime desc limit 1',
                    (err, result) => {
                      trending = result[0]
                      callback(trending)
                    }
                  )
                }
              })
            }
          )

          //If there is an occurence of trending check if it's still in effect
        } else if (
          new Date(trending.StartTime).valueOf() + trending.Lifespan <=
          new Date().valueOf()
        ) {
          // if it isn't then update the trending with a lifespan of one minute for dev testing and get the top trending
          updateTrending(60000, function () {
            mediaConnection.query(
              'select * from trending t where Tag<>"null" order by StartTime desc limit 1',
              (err, result) => {
                trending = result[0]
                callback(trending)
              }
            )
          })
        } else {
          // if it is in effect then use the previously found value
          callback(trending)
        }
      }
    }
  )
}

// Function to handle link shortening
function shortenLink (url, callback) {
  // If no link to shorten, return null
  if (url == null) callback(null)

  // Check if there is an existing shortened version of the past link
  mediaConnection.query(
    'select ID from URLSHORTENER where OriginalURL=?',
    url,
    (err, result) => {
      if (err) console.log('shortenLink' + err)
      // If there isn't insert the link and return the created id
      else if (result.length == 0) {
        mediaConnection.query(
          'insert into URLSHORTENER set ?',
          {
            OriginalURL: url
          },
          (err, result) => {
            if (err) console.log('shortenLink2' + err)
            callback(result.insertId)
          }
        )

        // If it does already exist, return that id
      } else {
        callback(result[0].ID)
      }
    }
  )
}

// Function to get a link from it's shortened id
function getLink (id, callback) {
  mediaConnection.query(
    'select OriginalURL from URLSHORTENER where ID=?',
    id,
    (err, result) => {
      if (err) console.log('shortenLink' + err)
      else callback(result[0].OriginalURL)
    }
  )
}

// Function to create a poll
function createPoll (PollObject, callback) {
  // If no poll return null
  if (PollObject == null) callback()
  mediaConnection.query('insert into POLL set ?', PollObject, (err, result) => {
    if (err) console.log(err)
    else {
      callback()
    }
  })
}

// Function to vote for a post with a choice
function voteFor (Username, PostID, Choice) {
  // Replace the previous vote (inserts if not existing)
  mediaConnection.query(
    'replace into vote set ?',
    {
      Username: Username,
      PostID: PostID,
      Choice: Choice
    },
    function (err, result) {
      if (err) console.log('Error in voteFor Check: ' + err)
    }
  )
}

function getAccount (viewerUsername, searchedUsername, callback) {
  let posts
  // Gets all posts by user, explained in Queries
  mediaConnection.query(
    'WITH PostLikes AS ( SELECT p.ID, COUNT(l.PostID) AS TotalLikes FROM POST p LEFT JOIN Likes l ON p.ID = l.PostID GROUP BY p.ID ), PostReplies AS ( SELECT r.OriginalPostID, COUNT(r.ReplyPostID) AS TotalReplies FROM Replies r GROUP BY r.OriginalPostID ), PostTags AS ( Select it.PostID, json_arrayagg(it.Tag) AS IncludedTags From IncludesTag it group by it.PostID ), PollVotes AS ( Select v.PostID, sum(if(Choice = 1, 1, 0)) as VotesFor1, sum(if(Choice = 2, 1, 0)) as VotesFor2 From Vote v group by v.PostID ) SELECT p.ID, p.Contents, p.CreatedTime, p.PosterUsername, p.ShortLinkID, pl.TotalLikes, pr.TotalReplies, r2.OriginalPostID, pt.IncludedTags, CASE WHEN l2.PostID IS NOT NULL THEN 1 ELSE 0 END AS LikedBySecondUser, u.OriginalURL, pl.Title, pl.Option1Text, pl.Option2Text, pv.VotesFor1, pv.VotesFor2, v.Choice as SecondUserChoice FROM POST p LEFT JOIN PostLikes pl ON p.ID = pl.ID LEFT JOIN PostReplies pr ON p.ID = pr.OriginalPostID LEFT JOIN Likes l2 ON p.ID = l2.PostID AND l2.Username = ? LEFT JOIN Replies r2 ON p.ID = r2.ReplyPostID LEFT JOIN PostTags pt ON p.ID = pt.PostID LEFT JOIN URLSHORTENER u ON p.ShortLinkID = u.ID LEFT JOIN POLL pl ON p.ID = pl.PostID LEFT JOIN PollVotes pv ON p.ID = pv.PostID LEFT JOIN Vote v ON p.ID = v.PostID and v.Username = ? WHERE p.PosterUsername = ?;',
    [viewerUsername, viewerUsername, searchedUsername],
    (err, rows) => {
      if (err) throw console.error(err)
      if (!err) {
        posts = rows
        console.log(posts)

        // get relvent user information including external links
        mediaConnection.query(
          'SELECT USER.Username, b.Birthday, d.Description, l.Location, el.Link FROM USER LEFT JOIN Birthday b ON USER.Username = b.Username LEFT JOIN Description d ON USER.Username = d.Username LEFT JOIN Location l ON USER.Username = l.Username LEFT JOIN ExternalLinks el ON USER.Username = el.Username WHERE USER.Username = ?;',
          searchedUsername,
          (err, rows) => {
            // Checks if user exists
            if (err) {
              console.error(err)
              callback({})
            } else if (rows.length == 0) {
              console.log('Posts' + rows)
              callback({})
            } else {
              console.log(rows)
              callback({ rows: rows, posts: posts })
            }
          }
        )
      }
    }
  )
}

module.exports = {
  mediaConnection,
  insertUser,
  removeUser,
  updateUser,
  addLink,
  removeLink,
  newPost,
  likePost,
  newHashtag,
  includeHashtag,
  getTrending,
  shortenLink,
  getLink,
  voteFor,
  getAccount
}
