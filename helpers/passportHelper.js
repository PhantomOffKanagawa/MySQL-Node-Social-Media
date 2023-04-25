const passport = require('passport');
const crypto = require('crypto');
const LocalStrategy = require('passport-local').Strategy;
const dbHelper = require('../helpers/dbHelper');

// Helper Callback that references the database to return
const verifyCallback = (username, password, done) => {
  dbHelper.mediaConnection.query(
    'SELECT * FROM USER WHERE Username = ? ',
    [username],
    function (error, results, fields) {
      // If error or no user found return error/null
      if (error) return done(error);
      if (results.length == 0) return done(null, false);

      const isValid = validPassword(password, results[0].Hash, results[0].Salt);
      if (isValid) {
        return done(null, {
          username: results[0].Username,
          hash: results[0].hash,
          salt: results[0].salt
        });
      } else {
        return done(null, false);
      }
    }
  )
}

const customFields={
  usernameField:'username',
  passwordField:'password',
};

// Registers the strategy to passport
const strategy = new LocalStrategy(customFields, verifyCallback);
passport.use(strategy);

// Registers function to serialize the user to print out user
passport.serializeUser((user, done) => {
  // console.log('serializeUser ' + JSON.stringify(user));
  done(null, user.username);
})

// Registers function to deserialize user info by getting from db
passport.deserializeUser(function (username, done) {
  // console.log('deserializeUser ' + username); Why does this call so often?
  dbHelper.mediaConnection.query(
    'SELECT * FROM USER where Username = ?',
    [username],
    function (error, results) {
      done(null, results[0])
    }
  )
})

// Helpers
//
//

// Helper that checks if a provided password attempt matches the previous hash
function validPassword (password, hash, salt) {
  const hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 60, 'sha512')
    .toString('hex')
  return hash === hashVerify
}

module.exports = passport;