const db = require("../database/connection")

class User{
    // GET
    static async getById(id, conn = null){
        const executor = conn || db

        const [rows] = await executor.execute(`
            SELECT idUser, username, password, tokenConfirmed
            FROM user_data
            WHERE idUser = ?
        `, [id])

        if(rows.length === 0){
            return false
        }
        return rows[0]
    }

    static async getByName(name, conn = null){
        const executor = conn || db

        const [rows] = await executor.execute(`
            SELECT idUser, username, password, tokenConfirmed
            FROM user_data
            WHERE username = ?
        `, [name])

        if(rows.length === 0){
            return false
        }

        return rows[0]
    }

    static async getTokenByName(username, conn = null){
        const executor = conn || db

        const [rows] = await executor.execute(`
            SELECT recoveryToken, idUser
            FROM user_data 
            WHERE username = ?
        `, [username])

        if(rows.length === 0){
            return false
        }

        return rows[0]
    }

    static async getTokenById(idUser, conn = null){
        const executor = conn || db

        const [rows] = await executor.execute(`
            SELECT recoveryToken AS token
            FROM user_data 
            WHERE idUser = ?
        `, [idUser])

        if(rows.length === 0){
            return false
        }

        return rows[0]
    }

    static async getTokenStatusById(idUser, conn = null){
        const executor = conn || db

        const [rows] = await executor.execute(`
            SELECT tokenConfirmed 
            FROM user_data
            WHERE idUser = ?
        `, [idUser])

        if(rows.length === 0){
            return false
        }

        return rows[0]
    }

    // CREATE
    static async create(name, password, conn = null){
        const executor = conn || db

        const [result] = await executor.execute(`
            INSERT INTO user_data (username, password) VALUES (?, ?)
        `, [name, password])

        if(result.affectedRows === 0){
            throw new Error("Error trying to add new user")
        }

        return result.insertId
    }

    static async delete(idUser, conn = null){
        const executor = conn || db

        const [result] = await executor.execute(`
            DELETE FROM user_data
            WHERE idUser = ?
        `, [idUser])

        if(result.affectedRows === 0){
            throw new Error("Error trying to delete account")
        }

        return true
    }

    // UPDATE
    static async updatePassword(newPassword, newToken, idUser, conn = null){
        const executor = conn || db

        const [result] = await executor.execute(`
            UPDATE user_data
            SET password = ?, recoveryToken = ?
            WHERE idUser = ?
        `, [newPassword, newToken, idUser])

        if(result.affectedRows === 0){
            throw new Error("Error trying to update password")
        }

        return true
    }

    static async updateUsername(newUsername, idUser, conn = null){
        const executor = conn || db

        const [result] = await executor.execute(`
            UPDATE user_data
            SET username = ?
            WHERE idUser = ?
        `, [newUsername, idUser])

        if(result.affectedRows === 0){
            throw new Error("Error trying to update username")
        }

        return true
    }

    static async updateTokenStatus(idUser, status, conn = null){
        const executor = conn || db

        const [result] = await executor.execute(`
            UPDATE user_data
            SET tokenConfirmed = ?
            WHERE idUser = ?
        `, [status, idUser])

        if(result.affectedRows === 0){
            throw new Error("Error trying to update token status")
        }

        return true
    }

    static async updateRecoveryToken(idUser, hashedToken, conn = null){
        const executor = conn || db

        const [result] = await executor.execute(`
            UPDATE user_data
            SET recoveryToken = ?
            WHERE idUser = ?
        `, [hashedToken, idUser])

        if(result.affectedRows === 0){
            throw new Error("Error trying to update recovery token")
        }

        return true
    }
}

module.exports = User