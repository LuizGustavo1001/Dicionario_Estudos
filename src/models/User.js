const db = require("../database/connection")

class User{
    static async getById(id){
        const [rows] = await db.execute(`
            SELECT idUser, username, userMail, password
            FROM user_data
            WHERE idUser = ?
        `, [id])

        if(rows.length === 0){
            return false
        }
        return rows[0] || null
    }

    static async getByName(name){
        const [rows] = await db.execute(`
            SELECT idUser, username, password
            FROM user_data
            WHERE username = ?
        `, [name])

        if(rows.length === 0){
            return false
        }

        return rows[0] || null
    }

    static async create(conn, name, email, password){
        const executor = conn || db

        const [result] = await executor.execute(`
            INSERT INTO user_data (username, userMail, password) VALUES (?, ?, ?)
        `, [name, email, password])

        if(result.affectedRows === 0){
            throw new Error("error trying to add new user")
        }

        return result.insertId
    }

    static async getByEmail(email){
        const [rows] = await db.execute(`
            SELECT idUser, username, password, userMail
            FROM user_data
            WHERE userMail = ?
        `, [email])

        if(rows.length === 0){
            return false
        }

        return rows[0] || null
    }

    static async verifyEmail(email){
        const [rows] = await db.execute(`
            SELECT userMail FROM user_data WHERE userMail = ?
        `, [email])

        if(rows.length === 0){
            return false
        }

        return true
    }
}

module.exports = User