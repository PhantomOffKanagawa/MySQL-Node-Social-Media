const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const routes = require('./routes/router');
require('dotenv').config();

// Middlewear and Express setup
app.use(expressLayouts);
app.set('layout', './layouts/default');
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));

app.use(routes);

// Set up Express server
const server = app.listen(3000, () => {
  console.log(`Listening on port ${server.address().port}`);
});