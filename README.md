
# Node.js & MySQL Social Media Project

A basic social media platform held on a local MySQL database with an React.js frontend managed by Node.js


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
  git clone -b MERN-Stack-Version https://github.com/PhantomOffKanagawa/MySQL-Node-Social-Media
```

Go to the project directory

```bash
  cd MySQL-Node-Social-Media
```

Install dependencies

```bash
  npm install
```

Install dependencies under react-frontend

```bash
  npm run install-react
```

Create a .env from the example and change the variables as specified in **Environment Variables**

```bash
  cp .env.example .env
```

Start the backend server

```bash
  npm run fresh
```

Seperately start the frontend

```bash
  npm run start-react
```

With that the server should be up and running and you can go to http://localhost:3000 to access the homepage of the "Social Media" site

> **Warning**
> This will drop any tables with the name provided in the .env (Default is `socialmedia`) on the provided database and replace it with this projects data
> 
## npm Scripts

To reset the tables for this project run

```bash
  npm run reset
```

> **Warning**
> This will drop any tables with the name provided in the .env (Default is `socialmedia`) on the provided database and replace it with this projects data

To start the web server without a resetting the database run

```bash
  npm run start
```

To start the web server with nodemon run

```bash
  npm run dev
```

## Features

- React.JS Frontend
- Node.JS Backend
- MySQL Database
- Encrypted Passwords
- Cookie Based Session Tracking
- Likes
- 3rd Normal Form Datbase Compliance
- Synthetic Example Data
- Code for Generating New Synthetic Data
-  
## File/Directory Glossary

`ls *.?*`
- `.env.example` an example .env file with all the variables that need to be included
- `.gitignore` the .gitignore files for what files not to include in source control
- `index.js` the main Node.js file that calls in helpers and starts the express server
- `package-lock.json` full package info
- `package.json` overall package info
- `README.md` *this*

`ls ./helpers` is a folder of Node.js helper modules
 - `dbHelper.js` interacts with the database and passes access to it as a module
 - `generate.js` generates new synthetic data, adjustable parameters at the top
 - `passportHelper.js` initializes passport and sets serialize/deserialize methods 
 - `reset.js` is a Node.js file run by npm commands `fresh` and `reset` and simply reformats the database
 - `.router.js` manages all the POST and GET middle-man for express

`ls ./sql` is a folder with all the SQL files
- `minified` contains copies of some of the files in `./sql` but in a one line to allow running from file
- `Queries.sql` contains the SQL Queries for many of the function calls
- `ResetTables.sql` contains the SQL to reset the tables
- `SQLinserts.sql` contains synthetic data inserts


## Tech Stack

**Client:** Bootstrap, JQuery, React

**Server:** Node, Express

**Database:** MySQL