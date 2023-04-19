if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const mysql2 = require('mysql2')

const mediaConnection = mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: 'socialMedia'
});

// const userConnection = mysql2.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: 'cookie_user'
// });

function insertUser (
  username,
  password,
  createdTime,
  birthday,
  description,
  location,
  hash,
  salt
) {
  const user = {
    Username: username,
    Password: password,
    CreatedTime: createdTime,
    Birthday: birthday,
    Description: description,
    Location: location,
    hash: hash,
    salt: salt
  }
  mediaConnection.query('INSERT INTO USER SET ?', user, function (err, result) {
    if (err) return false
    console.log('Result: ' + JSON.stringify(result[0]))
    return true
  })
}

function removeUser (username) {
  mediaConnection.query(
    'DELETE FROM USER WHERE Username = ?',
    [username],
    function (err, result) {
      if (err) throw err
      console.log('Result: ' + JSON.stringify(result[0]))
    }
  )
}

function query (query) {
  mediaConnection.query(query, function (err, result) {
    if (err) throw err
    console.log('Result:')
    for (let obj of result) {
      console.log(JSON.stringify(obj))
    }
  })
}

module.exports = { mediaConnection, insertUser, removeUser, query }
