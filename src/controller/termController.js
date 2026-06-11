const Meaning = require("../models/Meaning")
const Term = require("../models/Term")

const db        = require("../database/connection")

exports.getFolderTerms = async (req, res) => {
    const { folders } = req.query
    if(!folders){
        return res.status(400).json({ error: "missingFields" });
    }

    try{
        const foldersArray = folders.split(",")

        const terms = await Term.getAllByFolder(foldersArray)

        return res.json(terms)
    }catch(err){
        console.log(err)
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
        console.log(err)
        return res.status(500).json({ error: "serverError" })
    }
}

exports.createTerm = async (req, res) => {
    const { folderId } = req.params
    let { termName, meanings } = req.body
    const idUser = req.userId
    const files = req.files

    if(!folderId){
        return res.status(400).json({ error: "missingFields" })
    }

    try{
        if(typeof meanings === "string"){
            meanings = JSON.parse(meanings)
        }
    }catch(err){
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
                content: (currentFile) ? currentFile.path : null
            }
        }
        return meaning
    })

    const connection = await db.getConnection()

    try{
        await connection.beginTransaction()

        // insert term
        const newTermId = await Term.create(connection, folderId, termName)
        if(!newTermId){
            await connection.rollback()
            return res.status(400).json({ error: "invalidTerm" })
        }

        // insert meanings
        if(meanings && meanings.length > 0){
            await Meaning.processAndCreateMeanings(connection, newTermId, updatedMeanings, idUser)
        }

        await connection.commit()
        return res.status(201).json({ message: "termCreated", termId: newTermId })
    }catch(err){
        await connection.rollback()
        console.log(err)
        return res.status(500).json({ error: "serverError" })
    }finally{
        connection.release()
    }
}