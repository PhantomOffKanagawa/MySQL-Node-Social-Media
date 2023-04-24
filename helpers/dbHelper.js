const mysql2 = require('mysql2')
require('dotenv').config()

const mediaConnection = mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

function insertUser(
  username,
  createdTime,
  birthday,
  description,
  location,
  hash,
  salt
) {
  const user = {
    Username: username,
    CreatedTime: createdTime,
    Birthday: birthday,
    Description: description,
    Location: location,
    Hash: hash,
    Salt: salt
  }
  mediaConnection.query('INSERT INTO USER SET ?', user, function (err, result) {
    if (err) return false
    console.log('Result: ' + JSON.stringify(result))
    return true
  })
}

function removeUser(username) {
  mediaConnection.query(
    'DELETE FROM USER WHERE Username = ?',
    [username],
    function (err, result) {
      if (err) console.log(err.message)
      console.log('Result: ' + JSON.stringify(result[0]))
    }
  )
}

function updateUser(username, birthday, description, location) {
  var updateString = [
      birthday != '' ? `Birthday='${birthday}'` : '',
      description != '' ? `Description='${description}'` : '',
      location != '' ? `Location='${location}'` : ''
    ]
    .filter(Boolean)
    .join(', ')
  // console.log(updateString)
  if (updateString == '') return
  mediaConnection.query(
    'UPDATE USER SET ' + updateString + ' WHERE Username=?',
    username,
    function (err, result) {
      if (err) console.log(err.message)
      // console.log('Result: ' + JSON.stringify(result[0]));
      return true
    }
  )
}

function addLink(username, linkStr) {
  const link = {
    Username: username,
    Link: linkStr
  }
  mediaConnection.query('INSERT INTO ExternalLinks SET ?', link, function (err, result) {
    if (err) return false
    console.log('Result: ' + JSON.stringify(result[0]))
    return true
  })
}

function removeLink(username, linkStr) {
  mediaConnection.query(
    'DELETE FROM ExternalLinks WHERE Link = ? and Username = ?',
    [linkStr, username],
    function (err, result) {
      if (err) console.log(err.message)
      console.log('Result: ' + JSON.stringify(result))
    }
  )
}

function newPost(
  contents,
  createdTime,
  posterUsername,
  longLink,
  originalID,
  PollObject
) {
  shortenLink(longLink, function (id) {
    const post = {
      Contents: contents,
      CreatedTime: createdTime,
      PosterUsername: posterUsername,
      ShortLinkID: id
    }
    const m = contents.match(/(?<=^| )#(\S){1,20}(?= |$|\n)/g),
      match = (m == null) ? [] : Array.from(new Set(m));
    mediaConnection.query('INSERT INTO POST SET ?', post, function (err, result) {
      if (err) console.log(err)
      else {
        newID = result.insertId;
        console.log("newpost + " + typeof originalID);

        if (originalID != null) {
          const reply = {
            ReplyPostID: newID,
            OriginalPostID: originalID
          }
          mediaConnection.query('INSERT INTO Replies SET ?', reply, function (err, result) {
            if (err) console.log(err)
            else {
              console.log('Result: ' + JSON.stringify(result));
              console.log("linked reply");
            }
          })
        }

        console.log('Result: ' + JSON.stringify(result[0]));
        if (match.length != 0) {
          match.forEach(tag => {
            newHashtag(tag, function (tag) {
              includeHashtag(tag, newID)
            });
          });
        }

        if (PollObject != null) {
          PollObject.PostID = newID;
          createPoll(PollObject, function () {});
        }
        return true
      }
    })
  })
  console.log("newpost");
}

function newHashtag(Tag, callback) {
  mediaConnection.query('INSERT INTO Hashtag SET ?', {
    Tag: Tag
  }, function (err, result) {
    if (err && err.code != 'ER_DUP_ENTRY') console.log(err)
    else {
      console.log('newHashtag Result: ' + JSON.stringify(result));
      callback(Tag);
      return true
    }
  })
}

function includeHashtag(Tag, PostID) {
  mediaConnection.query('INSERT INTO IncludesTag SET ?', {
    PostID: PostID,
    Tag: Tag
  }, function (err, result) {
    if (err) console.log(err)
    else {
      console.log('newHashtag Result: ' + JSON.stringify(result));
      return true
    }
  })
}

// function includeHashtags(tags, PostID) {
//   if (tags.length > 5) tags.length = 5;
//   let objects = [];
//   console.log(tags);
//   tags.forEach(tag => {
//     objects.push({
//       PostID: PostID,
//       Tag: tag.substr(0, 20)
//     });
//   });
//   console.log(objects);
//   mediaConnection.query('INSERT INTO IncludesTag VALUES ?', objects, function (err, result) {
//     if (err) console.log(err)
//     else {
//       console.log('includeHashtags Result: ' + JSON.stringify(result));
//       return true
//     }
//   })
// }

function likePost(
  likerUsername,
  likedPostId,
  liked
) {
  console.log(liked + typeof liked)
  if (liked == "false") {
    const like = {
      Username: likerUsername,
      PostID: likedPostId,
    }
    mediaConnection.query('INSERT INTO Likes SET ?', like, function (err, result) {
      if (err) console.log(err)
      else {
        console.log('Result: ' + JSON.stringify(result));
        return true
      }
    })
  } else {
    mediaConnection.query('DELETE FROM Likes Where Username = ? and PostID = ?', [likerUsername, likedPostId], function (err, result) {
      if (err) console.log(err)
      else {
        console.log('Result: ' + JSON.stringify(result[0]));
        return true
      }
    })
  }
}

function updateTrending(lifespan, callback) {
  mediaConnection.query('with TagUses as ( select it.Tag, count(it.PostID) as UsedCount from IncludesTag it left join post p on p.ID = it.PostID where CreatedTime > (select StartTime from trending order by StartTime desc limit 1) group by it.Tag ) select h.Tag, usedCount from Hashtag h left join TagUses tu on h.Tag = tu.Tag order by tu.UsedCount desc limit 1;', function (err, result) {
    if (err) console.log("Error in update Trending " + err);
    // else if (result.length == 0)
    //   return;
    if (result.length == 0) callback(false);
    else {
      mediaConnection.query('insert into Trending set ?', {
        StartTime: new Date().toISOString(),
        Tag: (result[0].usedCount != null) ? result[0].Tag : null,
        Lifespan: lifespan
      }, (err, result) => {
        if (err) console.log("Error in update Trending " + err);
        callback(true)
      })
    }
  });
}

function getTrending(callback) {
  let trending;
  mediaConnection.query('select * from trending t where Tag<>"null" order by StartTime desc limit 1', (err, result) => {
    if (err) console.error(err);
    else {
      trending = result[0];
      console.log(typeof trending)
      if (typeof trending == 'undefined') {
        mediaConnection.query('insert into Trending set ?', {
          StartTime: 0,
          Tag: null,
          Lifespan: 0
        }, (err, result) => {
          // if (err) console.log("Error in get Trending " + err);
          updateTrending(60000, function (hadTag) {
            if (!hadTag) callback([]);
            else {
              mediaConnection.query('select * from trending t where Tag<>"null" order by StartTime desc limit 1', (err, result) => {
                trending = result[0]
                callback(trending)
              })
            }
          });
        })
      } else if (new Date(trending.StartTime).valueOf() + trending.Lifespan <= new Date().valueOf()) {
        console.log(typeof trending)
        updateTrending(60000, function () {
          mediaConnection.query('select * from trending t where Tag<>"null" order by StartTime desc limit 1', (err, result) => {
            trending = result[0]
            callback(trending)
          })
        });
      } else {
        callback(trending)
      }
    }
  })
}

function shortenLink(url, callback) {
  if (url == null) callback(null);
  mediaConnection.query('select ID from URLSHORTENER where OriginalURL=?', url, (err, result) => {
    if (err) console.log("shortenLink" + err);
    else if (result.length == 0) {
      mediaConnection.query('insert into URLSHORTENER set ?', {
        OriginalURL: url
      }, (err, result) => {
        if (err) console.log("shortenLink2" + err);
        callback(result.insertId);
      })

    } else {
      callback(result[0].ID);
    }
  })
}

function getLink(id, callback) {
  mediaConnection.query('select OriginalURL from URLSHORTENER where ID=?', id, (err, result) => {
    if (err) console.log("shortenLink" + err);
    else callback(result[0].OriginalURL);
  })
}

function createPoll(PollObject, callback) {
  if (PollObject == null) callback();
  mediaConnection.query('insert into POLL set ?', PollObject, (err, result) => {
    if (err) console.log(err)
    else {
      callback()
    }
  })
}

function voteFor(Username, PostID, Choice) {
  mediaConnection.query("replace into vote set ?", {
    Username: Username,
    PostID: PostID,
    Choice: Choice
  }, function (err, result) {
    if (err) console.log("Error in voteFor Check: " + err)
    else {
      return;
    }
  })
}

function query(query) {
  mediaConnection.query(query, function (err, result) {
    if (err) throw err
    console.log('Result:')
    for (let obj of result) {
      console.log(JSON.stringify(obj))
    }
  })
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
  query
}