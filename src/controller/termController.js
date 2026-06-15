const Meaning = require("../models/Meaning")
const Term = require("../models/Term")

const db = require("../database/connection")

exports.getFolderTerms = async (req, res) => {
    const { folders } = req.query
    if(!folders){
        return res.status(400).json({ error: "missingFields" })
    }

    try{
        const foldersArray = folders.split(",")

        const terms = await Term.getAllByFolder(foldersArray)

        return res.json(terms)
    }catch(err){
        console.log("Controller error: ", err)
        return res.status(500).json({ error: "serverError" })
    }
}

exports.getTermById = async (req, res) => {
    const { idTerm } = req.params
    const idUser = req.userId

    if(!idTerm){
        return res.status(400).json({ error: "missingFields" })
    }

    try{
        // retrieve term information (term + meanings)
        const term = await Term.getTermAndMeaningById(idTerm, idUser)

        if(!term){
            return res.status(404).json({ error: "termNotFound" })
        }

        return res.json(term)
    }catch(err){
        console.log("Controller error: ", err)
        return res.status(500).json({ error: "serverError" })
    }
}

exports.create = async (req, res) => {
    const { folderId } = req.params
    let { termName, meanings } = req.body
    const idUser    = req.userId
    const files     = req.files

    if(!folderId){
        return res.status(400).json({ error: "missingFields" })
    }

    try{
        if(typeof meanings === "string"){
            meanings = JSON.parse(meanings)
        }
    }catch(err){
        console.log("Controller error: ", err)
        await deleteTempFiles(files)
        return res.status(400).json({ error: "invalid_meanings_format" })
    }

    // mapping local files and image meanings
    let imageIndex = 0
    const updatedMeanings = meanings.map(meaning => {
        if(meaning.type === "image"){
            const currentFile = (files && files[imageIndex]) ? files[imageIndex] : null
            imageIndex++

            return{
                type: "image",
                content: (currentFile) ? currentFile.path : null // local path
            }
        }
        return meaning
    })

    const connection = await db.getConnection()

    try{
        await connection.beginTransaction()

        // insert term
        const newTermId = await Term.create(folderId, termName, connection)
        if(!newTermId){
            await connection.rollback()
            await deleteTempFiles(files)
            return res.status(400).json({ error: "invalidTerm" })
        }

        // insert meanings
        if(meanings && meanings.length > 0){
            await Meaning.processAndCreateMeanings(newTermId, updatedMeanings, idUser, connection)
        }

        await connection.commit()
        return res.status(201).json({ message: "termCreated", termId: newTermId })
    }catch(err){
        await connection.rollback()
        console.log("Controller error: ", err)

        await deleteTempFiles(files)

        return res.status(500).json({ error: "serverError" })
    }finally{
        connection.release()
    }
}

async function deleteTempFiles(files){
    if(files && files.length > 0){
        for(const file of files){
            if(file.path){
                try {
                    await fs.unlink(file.path)
                }catch (err){
                    console.log("Error trying to delete temp file:", err.message)
                }
            }
        }
    }
}

exports.updateName = async(req, res) => {
    const { idTerm } = req.params
    const { termName } = req.body

    if(!idTerm || !termName){
        return res.status(400).json({ error: "missingFields" })
    }

    try{
        await Term.updateName(idTerm, termName)

        return res.status(200).json({ message: "termNameUpdated" })
    }catch(err){
        console.log("Controller error: ", err)
        return res.status(500).json({ error: "serverError" })
    }
}
