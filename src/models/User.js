const db = require("../database/connection")

class User{
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

    static async create(conn, name, password){
        const executor = conn || db

        const [result] = await executor.execute(`
            INSERT INTO user_data (username, password) VALUES (?, ?)
        `, [name, password])

        if(result.affectedRows === 0){
            throw new Error("error trying to add new user")
        }

        return result.insertId
    }

    static async getTokenByName(conn, username){
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

    static async getTokenById(conn, idUser){
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

    static async updatePassword(conn, newPassword, newToken, idUser){
        const executor = conn || db

        const [result] = await executor.execute(`
            UPDATE user_data
            SET password = ?, recoveryToken = ?
            WHERE idUser = ?
        `, [newPassword, newToken, idUser])

        if(result.affectedRows === 0){
            throw new Error("error trying to update password")
        }

        return true
    }

    static async updateUsername(newUsername, idUser, conn){
        const executor = conn || db

        const [result] = await executor.execute(`
            UPDATE user_data
            SET username = ?
            WHERE idUser = ?
        `, [newUsername, idUser])

        if(result.affectedRows === 0){
            throw new Error("error trying to update username")
        }

        return true
    }

    static async updateTokenStatus(conn, idUser, status){
        const executor = conn || db

        const [result] = await executor.execute(`
            UPDATE user_data
            SET tokenConfirmed = ?
            WHERE idUser = ?
        `, [status, idUser])

        if(result.affectedRows === 0){
            throw new Error("error trying to update token status")
        }

        return true
    }


    static async getTokenStatusById(conn, idUser){
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

    static async updateRecoveryToken(conn, idUser, hashedToken){
        const executor = conn || db

        const [result] = await executor.execute(`
            UPDATE user_data
            SET recoveryToken = ?
            WHERE idUser = ?
        `, [hashedToken, idUser])

        if(result.affectedRows === 0){
            throw new Error("error trying to update recovery token")
        }

        return true
    }


    static async delete(idUser, conn){
        const executor = conn || db

        const [result] = await executor.execute(`
            DELETE FROM user_data
            WHERE idUser = ?
        `, [idUser])

        if(result.affectedRows === 0){
            throw new Error("error trying to delete account")
        }

        return true
    }
}

module.exports = User