const db = require("../database/connection")

class Folder{
    static async create(conn, idUser, nameFolder = null, color = null){
        const executor = conn || db

        if(nameFolder == null){
            nameFolder = "Primeira Pasta"
        }

        const [result] = await executor.execute(`
            INSERT INTO folder_data (nameFolder, colorFolder, idUser) VALUES (?, ?, ?)
        `, [nameFolder, color || "#EF8CB9", idUser])

        if(result.affectedRows === 0){
            throw new Error("error trying to add new folder")
        }
        return result.insertId
    }

}

module.exports = Folder