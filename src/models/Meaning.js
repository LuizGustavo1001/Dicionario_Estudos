const db = require("../database/connection")
const cloudinary = require("cloudinary").v2
const fs = require("fs").promises // clear /uplaods folder

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

class Meaning{
    static async getAllByTerm(idTerms){
        if(!idTerms || idTerms.length === 0) return []

        const [rows] = await db.query(
            `SELECT * FROM meaning_data WHERE idTerm IN (?)`,
            [idTerms] 
        )

        return rows
    }

    static async create(conn, idTerm, content = null, type = 'text', publicId = null, secureURL = null){
        const executor = conn || db

        if(content == null){
            content = "Significados podem ser tanto <strong>imagens</strong> quanto <strong>textos</strong>"
        }

        const [result] = await executor.execute(`
            INSERT INTO meaning_data (content, type, idTerm, public_id, secure_url) VALUES (?, ?, ?, ?, ?)    
        `, [content, type, idTerm, publicId, secureURL])

        if(result.affectedRows === 0){
            throw new Error("error trying to add new meaning")
        }
        return result.insertId
    }

    static async processAndCreateMeanings(connection, idTerm, meanings, userId) {
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
                    throw new Error("failedUpload")
                }finally{ // clear /uploads folder
                    if(meaning.content){
                        try{
                            await fs.unlink(meaning.content)
                        }catch(FSerr){
                            console.log("Error trying to delete temp file: ", FSerr)
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