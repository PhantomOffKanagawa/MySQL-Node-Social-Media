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
function insertUser(username, createdTime, birthday, description, location, hash, salt) {
  mediaConnection.query('INSERT INTO USER SET ?', {
    Username: username,
    CreatedTime: createdTime,
    Birthday: birthday,
    Description: description,
    Location: location,
    Hash: hash,
    Salt: salt
  }, function (err, result) {
    if (err) console.log(err)
  })
}

// Function to remove a user (Never Used)
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

// Function to change a user's details, used by edit
function updateUser(username, birthday, description, location) {
  // Array of SQL line parts for updating the user
  const updateString = [
      birthday != '' ? `Birthday='${birthday}'` : '',
      description != '' ? `Description='${description}'` : '',
      location != '' ? `Location='${location}'` : ''
    ]
    .filter(Boolean)
    .join(', ')

  if (updateString == '') return
  mediaConnection.query(
    'UPDATE USER SET ' + updateString + ' WHERE Username=?',
    username,
    function (err, result) {
      if (err) console.log(err.message)
      return true
    }
  )
}

// Function that handles new post
function newPost(contents, createdTime, posterUsername) {
    // Insert the post
    mediaConnection.query('INSERT INTO POST SET ?', {
      Contents: contents,
      CreatedTime: createdTime,
      PosterUsername: posterUsername,
      ShortLinkID: null
    }, function (err, result) {

      if (err) console.log(err)
    })
}

// Function to write a like of a post
function likePost(likerUsername, likedPostId, liked) {
  // If not currently liked, insert like
  if (liked == 0) {
    mediaConnection.query('INSERT INTO Likes SET ?', {
      Username: likerUsername,
      PostID: likedPostId,
    }, function (err, result) {
      if (err) console.log(err)
      console.log(result)
    })

    // If currently liked, remove like
  } else {
    mediaConnection.query('DELETE FROM Likes Where Username = ? and PostID = ?', [likerUsername, likedPostId], function (err, result) {
      if (err) console.log(err)
    })
  }
}

module.exports = {
  mediaConnection,
  insertUser,
  removeUser,
  updateUser,
  newPost,
  likePost
}