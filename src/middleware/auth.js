const JWT = require("jsonwebtoken")

exports.protect = async(req, res, next) => {
    const token = req.cookies.token

    if(!token){
        return res.status(401).json({ error: "notAuthenticated" })
    }

    try{
        const decoded = JWT.verify(token, process.env.JWT_SECRET)

        req.userId = decoded.idUser
        next()
    }catch(err){
        return res.status(401).json({ error: 'invalidToken' })
    }
}