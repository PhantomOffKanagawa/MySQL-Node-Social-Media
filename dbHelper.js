const mysql2 = require('mysql2')

const con = mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: 'socialMedia'
})

function insertUser (
  username,
  password,
  createdTime,
  birthday,
  description,
  location
) {
  const user = {
    Username: username,
    Password: password,
    CreatedTime: createdTime,
    Birthday: birthday,
    Description: description,
    Location: location
  }
  con.query('INSERT INTO USER SET ?', user, function (err, result) {
    if (err) return false;
    console.log('Result: ' + JSON.stringify(result[0]));
    return true;
  })
}

function removeUser (username) {
  con.query(
    'DELETE FROM USER WHERE Username = ?',
    [username],
    function (err, result) {
      if (err) throw err
      console.log('Result: ' + JSON.stringify(result[0]))
    }
  )
}

function query (query) {
  con.query(query, function (err, result) {
    if (err) throw err
    console.log('Result:')
    for (obj of result) {
      console.log(JSON.stringify(obj))
    }
  })
}

module.exports = { con, insertUser, removeUser, query }
