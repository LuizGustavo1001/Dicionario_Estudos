const Folder = require("../models/Folder")

exports.getUserFolders = async (req, res) => {
    try{
        const folders = await Folder.getByIdUser(req.userId)

        return res.json(folders)
    }catch(err){
        return res.status(500).json({ error: "serverError" })
    }
}