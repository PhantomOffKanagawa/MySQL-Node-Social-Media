
# Node.js & MySQL Social Media Project

A basic social media platform held on a local MySQL database with an Express frontend managed by Node.js


## Environment Variables

To run this project, you will need to add the following database environment variables to your .env file

An example is provided in `.env.example` with example values supplied

`DB_HOST`
`DB_USERNAME`
`DB_PASSWORD`
`DB_NAME`
## To Run Locally

Clone the project

```bash
  git clone https://github.com/PhantomOffKanagawa/MySQL-Node-Social-Media
```

Go to the project directory

```bash
  cd MySQL-Node-Social-Media
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run fresh
```

With that the server should be up and running and you can go to http://localhost:3000 to access the homepage of the "Social Media" site

> **Warning**
> This will drop any tables with the name provided in the .env (Default is `socialmedia`) on the provided database and replace it with this projects data
## npm Scripts

To reset the tables for this project run

```bash
  npm run reset
```

> **Warning**
> This will drop any tables with the name provided in the .env (Default is `socialmedia`) on the provided database and replace it with this projects data

To start the web server without a fresh database run

```bash
  npm run start
```

To start the web server with nodemon run

```bash
  npm run dev
```
## Features

- Encrypted Passwords
- Cookie Based Session Tracking
- Polls
- Likes
- Replies
- URL Shortener
- #Hashtags
- 3rd Normal Form Datbase Compliance
- Trending Page for Top #Hashtag
- Synthetic Example Data TODO
## File/Directory Glossary

`ls ./helpers` is a folder of Node.js helper modules
 - `dbHelper.js` interacts with the database and passes access to it as a module
 - `passportHelper.js` initializes passport and sets serialize/deserialize methods 
 - `reset.js` is a Node.js file run by npm commands `fresh` and `reset` and simply reformats the database
- `.router.js` manages all the POST and GET middle-man for express

`ls ./sql` is a folder with all the SQL files
- `minified` contains copies of some of the files in `./sql` but in a one line to allow running from file
- `DummyData.sql` contains synthetic data inserts
- `Queries.sql` contains the SQL Queries for many of the function calls **TODO UPDATE**
- `ResetTables.sql` contains the SQL to reset the tables
- `Worksheet.sql` was a file used as scratch paper when developing SQL Queries

`ls ./views` contains the ejs files used for client side rendering
- `widgets` contains smaller ejs components used in other ejs files
- `0_skeleton` the main ejs layout used as a template for all others
- `account.ejs` the ejs file used to render `/myaccount` and `/account/username` pages
- `index.ejs` the ejs file for the main page
- `linkShortener.ejs` the ejs file for the link shortening page
- `login.ejs` the ejs file for the login page
- `register.ejs` the ejs file for the register page
- `viewpost.ejs` the ejs file for viewing specific posts and their replies or tags

`ls ./views/widgets`

## Tech Stack

**Client:** Bootstrap, JQuery, EJS

**Server:** Node, Express

**Database:** MySQL