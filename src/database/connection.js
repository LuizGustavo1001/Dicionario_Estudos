const mysql = require("mysql2")

const connection = mysql.createPool({
    host: "db",
    user: "root",
    password: "root",
    database: "dictionary_admin"
}).promise()

module.exports = connection