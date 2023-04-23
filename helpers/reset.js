const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)

const dbHelper = require('./dbHelper');
require('dotenv').config();

dbHelper.reset(function () {
    new MySQLStore({}, dbHelper.mediaConnection);
    process.exit();
});