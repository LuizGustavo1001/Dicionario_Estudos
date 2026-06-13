const db = require("../database/connection")
const cloudinary = require("cloudinary").v2
const fs = require('fs').promises

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

class Meaning{
    // GET
    static async getAllByTerm(idTerms){
        if(!idTerms || idTerms.length === 0) return []

        const [rows] = await db.query(
            `SELECT * FROM meaning_data WHERE idTerm IN (?)`,
            [idTerms] 
        )

        if(rows.length === 0){
            return false
        }

        return rows
    }

    // CREATE
    static async create(conn, idTerm, content = null, type = 'text', publicId = null, secureURL = null){
        const executor = conn || db

        if(content == null){
            content = "Significados podem ser tanto <strong>imagens</strong> quanto <strong>textos</strong>"
        }

        const [result] = await executor.execute(`
            INSERT INTO meaning_data (content, type, idTerm, public_id, secure_url) VALUES (?, ?, ?, ?, ?)    
        `, [content, type, idTerm, publicId, secureURL])

        if(result.affectedRows === 0){
            throw new Error("Error trying to add new meaning")
        }
        return result.insertId
    }

    // UPDATE
    static async updateTextContent(idMeaning, value, conn){
        const executor = conn || db

        const [result] = await executor.execute(`
            UPDATE meaning_data
            SET content = ?
            WHERE idMeaning = ?
        `, [value, idMeaning])

        if(result.affectedRows === 0){
            throw new Error("Error trying to update meaning text content")
        }
        return true
    }

    // DELETE
    static async deleteTextContent(idMeaning, conn){
        const executor = conn || db

        const [result] = await executor.execute(`
            DELETE FROM meaning_data
            WHERE idMeaning = ?
        `, [idMeaning])

        if(result.affectedRows === 0){
            throw new Error("Error trying to delete meaning")
        }
        return true
    }

    // OTHERS
    static async processAndCreateMeanings(connection, idTerm, meanings, userId){
        for(const meaning of meanings){
            if(meaning.type == "image"){ // upload image
                try{
                    const uploadResult = await cloudinary.uploader.upload(meaning.content, {
                        resource_type: "auto",
                        folder: `home/dicionario_estudos/users/${userId}`
                    })

                    await this.create(
                        connection,
                        idTerm,
                        uploadResult.secure_url,
                        "image",
                        uploadResult.public_id,
                        uploadResult.secure_url
                    )
                }catch(err){
                    console.error("Cloudinary Upload error: ", err)
                    throw new Error("uploadFailed")
                }finally{
                    if(meaning.content && !meaning.content.startsWith('http') && !meaning.content.startsWith('data:')){
                        try{
                            await fs.access(meaning.content)
                            await fs.unlink(meaning.content)
                        }catch(FSerror){
                            
                        }
                    }
                }
            }else{
                await this.create(connection, idTerm, meaning.content, "text")
            }
        }
    }
}

module.exports = Meaning