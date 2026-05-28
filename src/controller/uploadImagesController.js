
/*
const cloudinary = require("cloudinary").v2

const Meaning = require("../models/Meaning")


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

exports.uploadImage = async (req, res) => {
    const { userId } = req.body
    const imagePath = req.file ? req.file.path : null

    if(!userId){
        return res.status(400).json({ success: false, error: "userIdRequired" })
    }

    if(!imagePath){
        return res.status(400).json({ success: false, error: "noImageProvided" })
    }

    try{
        const result = await cloudinary.uploader.upload(imagePath, {
            resource_type: "auto",
            folder: `home/dicionario_estudos/users/${userId}`
        })
        
        return res.status(200).json({ success: true, data: result })
    }catch(err){
        console.error("Error trying to upload image: ", err)
        return res.status(500).json({ success: false, error: "upload_error" })
    }finally{
        connection.release()
    }
}

exports.deleteImage = async (req, res) => {
    const { public_id } = req.body

    if(!public_id){
        return res.status(400).json({ success: false, error: "publicIdRequired" })
    }

    try{
        const result = await cloudinary.uploader.destroy(public_id)

        if(result.result === "ok"){
            return res.status(200).json({ success: true, message: "imageDeleted" })
        }else{
            return res.status(404).json({ success: false, error: "imageNotFound" })
        }
    }catch(err){
        console.error("Error trying to delete image: ", err)
        return res.status(500).json({ success: false, error: "delete" })
    }
}

/* 

result: {public_id, secure_url}

public_id: caminho completo com o id aleatório da imagem (home/dicionario_estudos/users/12345/as89dfa7sdf89)
secure_url: URL HTTPS para exibição no front-end
*/