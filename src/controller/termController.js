const Meaning = require("../models/Meaning")
const Term = require("../models/Term")

const db        = require("../database/connection")

exports.getFolderTerms = async (req, res) => {
    const { folders } = req.body

    try{
        const terms = await Term.getAllByFolder(folders)
        return res.json(terms)
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: "serverError" })
    }
}

exports.createTerm = async (req, res) => {
    let { idFolder, termName, meanings } = req.body
    const idUser = req.userId
    const files = req.files

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
        const newTermId = await Term.create(connection, idFolder, termName)
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