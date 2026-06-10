const Meaning = require("../models/Meaning")

exports.getTermMeanings = async (req, res) => {
    const { terms } = req.query
    if(!terms){
        return res.status(400).json({ error: "missingFields" })
    }

    try{
        const termsArray = terms.split(",") // [1,2,3] -> "1,2,3"

        const meanings = await Meaning.getAllByTerm(termsArray)
        
        return res.json(meanings)
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: "serverError" })
    }
}

exports.createMeaning = async (req, res) => {
    const { idTerm, meanings } = req.body
    const idUser = req.userId

    if (!idTerm || !meanings || !idUser) {
        return res.status(400).json({ error: "missingFields" })
    }

    const connection = await db.getConnection()

    try{
        await connection.beginTransaction()

        await Meaning.processAndCreateMeanings(connection, idTerm, meanings, idUser)

        await connection.commit()
        return res.status(201).json({ message: "MeaningCreated" })
    }catch(err){
        await connection.rollback()
        console.log(err)
        return res.status(500).json({ error: "serverError" })
    }finally{
        connection.release()
    }
}