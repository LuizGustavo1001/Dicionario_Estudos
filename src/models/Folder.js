const db = require("../database/connection")

class Folder{
    static async getAll(){
        const [result] = await db.execute(`
            SELECT * FROM folder_data
        `)

        if(result.length === 0){
            throw new Error("No folder found")
        }

        return result
    }

    static async getByIdUser(idUser){
        const [rows] = await db.execute(`
            SELECT * FROM folder_data WHERE idUser = ?    
        `, [idUser])

        return rows
    }

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

    static async delete(idFolder){
        const [result] = await db.execute(`
            DELETE FROM folder_data
            WHERE idFolder = ?
        `, [idFolder])

        if(result.affectedRows === 0){
            throw new Error("error trying to delete folder")
        }

        return true
    }

    static async getByName(idFolder){
        const [rows] = await db.execute(`
            SELECT *
            FROM folder_data
            WHERE idFolder = ?    
        `. idFolder)

        if(rows.length === 0){
            return false
        }
        return rows[0] || null
    }

    static async getByName(conn, nameFolder){
        const executor = conn || db

        const [rows] = await executor.execute(`
            SELECT * 
            FROM folder_data
            WHERE nameFolder = ?    
        `, [nameFolder])

        if(rows.length === 0){
            return false
        }
        return rows[0] || null
    }

    static async editData(folderId, data){
        const entries = Object.entries(data).filter(([_, value]) => value !== undefined)

        if(entries.length === 0) throw new Error("No data provided to update")

        const setClause = entries.map(([key]) => `${key} = ?`).join(", ")

        const values = entries.map(([_, value]) => value)

        values.push(folderId)

        const [result] = await db.execute(`
            UPDATE folder_data
            SET ${setClause}
            WHERE idFolder = ?    
        `, values)

        if(result.affectedRows === 0){
            throw new Error("error trying to edit folder data")
        }

        return result
    }
}

module.exports = Folder