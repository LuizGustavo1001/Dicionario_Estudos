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
}

module.exports = Meaning