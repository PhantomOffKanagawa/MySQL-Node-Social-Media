if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const mysql2 = require('mysql2')

const mediaConnection = mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: 'socialMedia'
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
  shortLinkID
) {
  const post = {
    Contents: contents,
    CreatedTime: createdTime,
    PosterUsername: posterUsername,
    ShortLinkID: shortLinkID
  }
  mediaConnection.query('INSERT INTO POST SET ?', post, function (err, result) {
    if (err) console.log(err)
    else {
      console.log('Result: ' + JSON.stringify(result[0]));
      return true
    }
  })
  console.log("newpost");
}

function replyPost(contents, createdTime, posterUsername, shortLinkID, originalID) {
  let newID;
  const post = {
    Contents: contents,
    CreatedTime: createdTime,
    PosterUsername: posterUsername,
    ShortLinkID: shortLinkID
  }
  mediaConnection.query('INSERT INTO POST SET ?', post, function (err, result) {
    if (err) console.log(err)
    else {
      console.log('Result: ' + JSON.stringify(result));
      newID = result.insertId;
      console.log("newpost");

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
  })
}

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

function newHashtag(Tag) {
  mediaConnection.query('INSERT INTO Hashtag SET ?', {
    Tag: Tag
  }, function (err, result) {
    if (err) console.log(err)
    else {
      console.log('Result: ' + JSON.stringify(result));
      return true
    }
  })
}

function includeHashtags(Tag, PostID) {
  if (Tag.length > 5) Tag.length = 5;
  let objects = [];
  Tag.array.forEach(tag => {
    objects.push({
      PostID: PostID,
      Tag: tag.substr(0,20)
    });
  });
  mediaConnection.query('INSERT INTO IncludesTag SET ?', objects, function (err, result) {
    if (err) console.log(err)
    else {
      console.log('Result: ' + JSON.stringify(result));
      return true
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
  replyPost,
  likePost,
  query
}