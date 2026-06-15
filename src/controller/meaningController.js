const Meaning = require("../models/Meaning")

const db = require("../database/connection")
const cloudinary = require("cloudinary").v2
const fs = require('fs').promises

exports.getByTerm = async (req, res) => {
    const { terms } = req.query
    if(!terms){
        return res.status(400).json({ error: "missingFields" })
    }

    try{
        const termsArray = terms.split(",") // [1,2,3] -> "1,2,3"

        const meanings = await Meaning.getAllByTerm(termsArray)
        
        return res.json(meanings)
    }catch(err){
        console.log("Controller error: ", err)
        return res.status(500).json({ error: "serverError" })
    }
}

exports.create = async (req, res) => {
    const { idTerm } = req.params
    const { meaningType } = req.body
    const idUser = req.userId
    const file = req.file

    if (!idTerm || !meaningType || !idUser) {
        if(file) await fs.unlink(file.path).catch(() => {})
        return res.status(400).json({ error: "missingFields" })
    }

    const connection = await db.getConnection()

    try{
        await connection.beginTransaction()

        let content = req.body.meaningContent
        if (meaningType === "image" && file) {
            content = file.path
        }

        const meaningData = {
            content: content,
            type: meaningType
        }

        await Meaning.processAndCreateMeanings(idTerm, [meaningData], idUser, connection)

        await connection.commit()
        return res.status(201).json({ message: "MeaningCreated" })
    }catch(err){
        await connection.rollback()
        console.log("Controller error: ", err)

        if(file){
            try { await fs.unlink(file.path) } catch(e) {}
        }

        return res.status(500).json({ error: "serverError" })
    }finally{
        connection.release()
    }
}

exports.updateTextContent = async (req, res) => {
    const { idMeaning } = req.params
    const { meaningContent } = req.body

    if(!idMeaning || !meaningContent){
        return res.status(400).json({ error: "missingFields" })
    }

    try{
        // find meaning at database
        const meaning = await Meaning.getById(idMeaning, connection)
        if(!meaning){
            return res.status(404).json({ error: "meaningNotFound" })
        }

        await Meaning.updateTextContent(meaning.idMeaning, meaningContent)

        return res.status(200).json({ message: "meaningUpdated" })
    }catch(err){
        console.log("Controller error: ", err)
        return res.status(500).json({ error: "serverError" })
    }
}

exports.deleteTextContent = async (req, res) => {
    const { idMeaning } = req.params
    
    if(!idMeaning){
        return res.status(400).json({ error: "missingFields" })
    }

    const connection = await db.getConnection()

    try{
        await connection.beginTransaction()

        // find meaning at database
        const meaning = await Meaning.getById(idMeaning, connection)
        if(!meaning){
            return res.status(404).json({ error: "meaningNotFound" })
        }

        // delete from database
        await Meaning.delete(meaning.idMeaning, connection)

        await connection.commit()

        return res.status(200).json({ message: "meaningDeleted" })
    }catch(err){
        console.log("Controller error: ", err)
        return res.status(500).json({ error: "serverError" })
    }
}

exports.deleteImageContent = async (req, res) => {
    const { idMeaning } = req.body

    if(!idMeaning){
        return res.status(400).json({ error: "missingFields" })
    }

    const connection = await db.getConnection()

    try{
        await connection.beginTransaction()

        // find meaning at database
        const meaning = await Meaning.getById(idMeaning, connection)
        if(!meaning){
            return res.status(404).json({ error: "meaningNotFound" })
        }


        // delete from cloud
        if(meaning.type == "image" && meaning.public_id){
            const cloudResult = await cloudinary.uploader.destroy(meaning.public_id)

            if(cloudResult.result !== "ok" && cloudResult.result !== "not_found"){
                throw new Error("Cloudinary deletion failed")
            }
        }

        // delete from database
        await Meaning.delete(idMeaning, connection)

        await connection.commit()

        return res.status(200).json({ message: "meaningDeleted" })
    }catch(err){
        console.log("Controller error: ", err)
        if (connection) await connection.rollback()
        return res.status(500).json({ error: "serverError" })
    }finally{
        connection.release()
    }
}