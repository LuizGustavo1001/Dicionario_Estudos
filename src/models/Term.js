const db = require("../database/connection")
 
class Term{
    // GET
    static async getAll(order = 'date'){
        const orderBy = order

        const [rows] = await db.execute(
            `SELECT * FROM term_data ORDER BY ${orderBy}`
        )

        if(rows.length === 0){
            return false
        }

        return rows
    }

    static async getByName(conn, nameTerm){
        const executor = conn || db

        const [rows] = await executor.execute(`
            SELECT * 
            FROM term_data
            WHERE content = ?
        `, [nameTerm])

        if(rows.length === 0){
            return false
        }

        return rows[0]
    }

    static async getById(idTerm, idUser, conn){
        const executor = conn || db

        const [rows] = await executor.execute(`
            SELECT t.content, t.idTerm 
            FROM term_data AS t 
                JOIN folder_data AS f ON f.idFolder = t.idFolder
                JOIN user_data AS u ON u.idUser = f.idUser
            WHERE t.idTerm = ? AND u.idUser = ?
        `, [idTerm, idUser])

        if(rows.length === 0){
            return false
        }

        return rows
    }

    static async getTermAndMeaningById(idTerm, idUser, conn){
        const executor = conn || db

        const [rows] = await executor.execute(`
            SELECT t.content AS termName, t.idTerm, m.content AS meaningContent, m.type, m.secure_url
            FROM term_data AS t 
                JOIN folder_data AS f ON f.idFolder = t.idFolder
                JOIN user_data AS u ON u.idUser = f.idUser
                JOIN meaning_data AS m ON m.idTerm = t.idTerm
            WHERE t.idTerm = ? AND u.idUser = ?
        `, [idTerm, idUser])

        if(rows.length === 0){
            return false
        }

        return rows
    }

    static async getAllByFolder(idFolders){
        if(!idFolders || idFolders.length === 0) return []

        const [rows] = await db.query(
            `SELECT * FROM term_data WHERE idFolder IN (?)`,
            [idFolders] 
        )

        if(rows.length === 0){
            return false
        }

        return rows
    }

    // CREATE
    static async create(conn, idFolder, term = null){
        const executor = conn || db
        
        if(term == null){
            term = "Termo Exemplo #1"
        }
        
        const [result] = await executor.execute(`
            INSERT INTO term_data (content, idFolder) VALUES (?, ?)
        `, [term, idFolder])

        if(result.affectedRows === 0){
            throw new Error("Error trying to add new term")
        }
        return result.insertId
    }
}

module.exports = Term