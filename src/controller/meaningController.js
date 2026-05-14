const Meaning = require("../models/Meaning")

exports.getTermMeaning = async (req, res) => {
    const { terms } = req.body

    try{
        const meanings = await Meaning.getAllByTerm(terms)
        return res.json(meanings)
    }catch(err){
        return res.status(500).json({ error: "serverError" })
    }
}