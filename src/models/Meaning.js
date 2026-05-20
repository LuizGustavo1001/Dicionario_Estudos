const db = require("../database/connection")

class Meaning{
    static async getAllByTerm(idTerms){
        if(!idTerms || idTerms.length === 0) return []

        const [rows] = await db.query(
            `SELECT * FROM meaning_data WHERE idTerm IN (?)`,
            [idTerms] 
        )

        return rows
    }

    static async create(conn, idTerm, content = null, type = 'text'){
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

module.exports = Meaning