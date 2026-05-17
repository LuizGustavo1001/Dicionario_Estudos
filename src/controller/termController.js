const Term = require("../models/Term")

exports.getFolderTerms = async (req, res) => {
    const { folders } = req.body

    try{
        const terms = await Term.getAllByFolder(folders)
        return res.json(terms)
    }catch(err){
        return res.status(500).json({ error: "serverError" })
    }
}

