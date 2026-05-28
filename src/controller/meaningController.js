const Meaning = require("../models/Meaning")

exports.getTermMeaning = async (req, res) => {
    const { terms } = req.body

    try{
        const meanings = await Meaning.getAllByTerm(terms)
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
        return res.status(400).json({ error: "missingMeaningFields" });
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