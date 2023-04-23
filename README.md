
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
## Tech Stack

**Client:** Bootstrap, JQuery, EJS

**Server:** Node, Express

**Database:** MySQL