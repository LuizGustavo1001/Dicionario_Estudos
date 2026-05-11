const db = require("../database/connection")

class Term{
    static async getAll(order = 'date'){
        const orderBy = order

        const [rows] = await db.execute(
            `SELECT * FROM term_data ORDER BY ${orderBy}`
        )

        return rows
    }

    static async create(term, meaning){
        await db.execute(
            "INSERT INTO terms (term, meaning, created_at) VALUES (?, ?, NOW())",
            [term, meaning]
        );
    }

    static async test(term, meaning){
        return `teste de criação de rota (termo: ${term}, Significado: ${meaning})`
    }
}

module.exports = Term