const mysql = require("mysql2")
require("dotenv").config()

const connection = mysql.createPool({
    host: "db",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "dictionary_admin"
}).promise()

module.exports = connection