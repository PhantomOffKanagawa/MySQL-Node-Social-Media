const passport = require('passport');
const crypto = require('crypto');
const LocalStrategy = require('passport-local').Strategy;
const dbHelper = require('../helpers/dbHelper');

const verifyCallback = (username, password, done) => {
  dbHelper.mediaConnection.query(
    'SELECT * FROM USER WHERE Username = ? ',
    [username],
    function (error, results, fields) {
      if (error) return done(error)

      if (results.length == 0) {
        return done(null, false)
      }
      const isValid = validPassword(password, results[0].hash, results[0].salt)
      user = {
        // id: results[0].id,
        username: results[0].Username,
        hash: results[0].hash,
        salt: results[0].salt
      }
      if (isValid) {
        return done(null, user)
      } else {
        return done(null, false)
      }
    }
  )
}

const customFields={
  usernameField:'username',
  passwordField:'password',
};

const strategy = new LocalStrategy(customFields, verifyCallback)
passport.use(strategy)

passport.serializeUser((user, done) => {
  console.log('inside serialize' + JSON.stringify(user));
  // done(null, user.id)
  done(null, user.username)
})

passport.deserializeUser(function (userId, done) {
  console.log('deserializeUser' + userId)
  dbHelper.mediaConnection.query(
    'SELECT * FROM USER where Username = ?',
    [userId],
    function (error, results) {
      done(null, results[0])
    }
  )
})

// Helpers

function validPassword (password, hash, salt) {
  var hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 60, 'sha512')
    .toString('hex')
  return hash === hashVerify
}

module.exports = passport;