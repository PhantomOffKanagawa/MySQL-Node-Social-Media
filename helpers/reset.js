const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)

const mysql2 = require('mysql2')

require('dotenv').config()
var fs = require('fs')

const connection = mysql2.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
})

connection.query(`drop database if exists ${process.env.DB_NAME}; create database ${process.env.DB_NAME}; use ${process.env.DB_NAME};`, (err, result) => {
    if (err) throw err;
    else {
        const miniResetCode = fs.readFileSync('./sql/minified/ResetTables.sql').toString();

        connection.query(miniResetCode, (err, result) => {
            if (err) throw err;
            else {
                console.log("Reset Tables Successfully");

                const mediaConnection = mysql2.createConnection({
                    host: process.env.DB_HOST,
                    user: process.env.DB_USERNAME,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_NAME
                })
                new MySQLStore({}, mediaConnection)

                console.log("SQL Store successfully initialized");

                const miniInsertCode = fs.readFileSync('./sql/minified/SQLinserts.sql').toString();
        
                connection.query(miniInsertCode, (err, result) => {
                    if (err) throw err;
                    else {
                        console.log("Synthetic Data Successfully Inserted")

                        process.exit()
                    }});
            }
        })
    }
})