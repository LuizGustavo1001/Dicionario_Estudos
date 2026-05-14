const db = require("../database/connection")
 
class Term{
    static async getAll(order = 'date'){
        const orderBy = order

        const [rows] = await db.execute(
            `SELECT * FROM term_data ORDER BY ${orderBy}`
        )

        return rows
    }

    static async getAllByFolder(idFolders){
        if(!idFolders || idFolders.length === 0) return []

        const [rows] = await db.query(
            `SELECT * FROM term_data WHERE idFolder IN (?)`,
            [idFolders] 
        )

        return rows
    }

    static async create(conn, idFolder, term = null){
        const executor = conn || db
        
        if(term == null){
            term = "Termo exemplo #1"
        }
        
        const [result] = await executor.execute(`
            INSERT INTO term_data (content, idFolder) VALUES (?, ?)
        `, [term, idFolder])

        if(result.affectedRows === 0){
            throw new Error("error trying to add new term")
        }
        return result.insertId
    }

    static async insertMeaning(conn, idTerm, content = null, type = 'text'){
        const executor = conn || db

        if(content == null){
            content = "Significados podem ser tanto <strong>imagens</strong> quanto <strong>textos</strong>"
        }

        const [result] = await executor.execute(`
            INSERT INTO meaning_data (content, type, idTerm) VALUES (?, ?, ?)    
        `, [content, type, idTerm])

        if(result.affectedRows === 0){
            throw new Error("error trying to add new meaning")
        }
        return result.insertId
    }
}

module.exports = Term