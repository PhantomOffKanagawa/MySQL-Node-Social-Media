if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

const dbHelper = require('./helpers/dbHelper.js')
const con = dbHelper.con

con.connect(function (err) {
  if (err) throw err
  console.log('Connected!')
})

try {
  dbHelper.insertUser(
    'user5',
    'password5',
    1620000000,
    '2000-01-05',
    'Description for user5',
    'Location for user5'
  );
} catch (e) {
  console.error(e)
}

dbHelper.removeUser('user5')
dbHelper.insertUser(
  'user5',
  'password5',
  1620000000,
  '2000-01-05',
  'Description for user5',
  'Location for user5'
)
dbHelper.query('SELECT * FROM USER')
