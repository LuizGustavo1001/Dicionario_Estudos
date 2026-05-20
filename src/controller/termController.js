const Meaning = require("../models/Meaning")
const Term = require("../models/Term")

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

/*
exports.createTerm = async (req, res) => {
    const { idFolder, termName, meanings, type } = req.body
    
    const connection = await db.getConnection()

    try{
        // verify if term name already exists
        const term = await Term.getByName(connection, termName)
        if(term) return res.status(409).json({ error: "termExists"})

        // try insert term
        const newTerm = await Term.create(connection, idFolder, termName)

        // try insert meanings  
        meanings.forEach(meaning => {
            await Meaning.create(connection,newTerm, meaning, type)
        })

        await connection.commit()

        return res.status(201).json({ error: "termCreated" })
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: "serverError" })
    }finally{
        connection.release()
    }
}
    */