const db     = require("../database/connection")
const Folder = require("../models/Folder")

exports.getUserFolders = async (req, res) => {
    try{
        const folders = await Folder.getByIdUser(req.userId)

        return res.json(folders)
    }catch(err){
        console.log("Controller error: ", err)
        return res.status(500).json({ error: "serverError" })
    }
}

exports.createFolder = async (req, res) => {
    const { folderName, color } = req.body
    if(!folderName || !color){
        return res.status(400).json({ error: "missingFields" })
    }

    const connection = await db.getConnection()

    try{
        // verify if folder name already exists
        const folder = await Folder.getByName(connection, folderName)
        if(folder){
            await connection.rollback()
            return res.status(409).json({ error: "folderExists"})
        }
        
        // add folder
        const newFolderId = await Folder.create(connection, req.userId, folderName, color)

        await connection.commit()

        return res.status(201).json({ 
            insertId: newFolderId,
            message: "folderCreated" 
        })
    }catch(err){
        await connection.rollback()
        console.log("Controller error: ", err)
        return res.status(500).json({ error: "serverError" })
    }finally{
        connection.release()
    }
}

exports.editFolder = async (req, res) => {
    const { idFolder, folderName, color } = req.body
    if(!idFolder || !folderName || !color){
        return res.status(400).json({ error: "missingFields" })
    }

    try{
        const map = {
            nameFolder: folderName,
            colorFolder: color
        }

        await Folder.editData(idFolder, map)

        return res.status(201).json({ message: "folderModified" })
    }catch(err){
        console.log("Controller error: ", err)
        return res.status(500).json({ error: "serverError" })
    }
}

exports.removeFolder = async (req, res) => {
    const { idFolder } = req.body
    if(!idFolder){
        return res.status(400).json({ error: "missingFields" })
    }

    try{
        const removeFolder = await Folder.delete(idFolder)

        return res.status(201).json({ message: "folderDeleted" }) 
    }catch(err){
        console.log("Controller error: ", err)
        return res.status(500).json({ error: "serverError" })
    }
}