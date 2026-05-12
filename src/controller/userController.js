const bcrypt    = require("bcrypt")
const User      = require("../models/User")
const Folder    = require("../models/Folder")
const Term      = require("../models/Term")
const JWT       = require("jsonwebtoken")
const db        = require("../database/connection")

exports.login = async (req, res) => {
    const { username, password } = req.body

    const user = await User.getByName(username)

    if(! user){
        return res.status(404).json({ error: "userNotExists" })
    }

    const valid = await bcrypt.compare(password, user.password)

    if(! valid){
        return res.status(401).json({ error: "invalidPassword" })
    }

    // create JWT + store in a cookie
    const token = JWT.sign(
        {
            idUser: user.idUser
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" } // 30 days long sessions
    )

    res.cookie("token", token, { // HTTPOnly cookie
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 30
    })

    return res.json({ success: true })
}


exports.register = async (req, res) => {
    const { username, email, password } = req.body

    const user = await User.getByName(username)
    if(user){ return res.status(409).json({ error: "userExists" }) }

    const emailExists = await User.verifyEmail(email)
    if(emailExists){ return res.status(409).json({ error: "emailExists" }) }
    
    const connection = await db.getConnection() // execute db queries only when every query can be executed => using transactions

    try{
        await connection.beginTransaction() 

        const hashed = await bcrypt.hash(password, 10)

        const addUser = await User.create(connection, username, email, hashed)

        const exampleFolder = await Folder.create(connection, addUser)

        const exampleTerm = await Term.create(connection, exampleFolder)

        const exampleMeaning = await Term.insertMeaning(connection, exampleTerm)

        await connection.commit()

        return res.status(201).json({ error: "userCreated" })
    }catch(err){
        await connection.rollback()

        return res.status(400).json({ error: "dberror" })
    }finally{
        connection.release()
    }
}


exports.auth = async (req, res) => {
    const token = req.cookies.token
    
    if(!token){
        return res.status(401).json({ error: "notAuthenticated" })
    }

    try{ // decode token
        const decoded = JWT.verify(token, process.env.JWT_SECRET)

        return res.json({
            authenticated: true,
            user: decoded
        })

    }catch(err){
        return res.status(401).json({ error: "invalidToken" })
    }
}

exports.logout = (req, res) => {
    res.clearCookie("token")

    return res.json({ success: true })
}

exports.me = async (req, res) => {
    const token = req.cookies.token

    if(!token){
        return res.status(401).json({ erorr: "notAuthenticated" })
    }

    try{
        const decoded = JWT.verify(token, process.env.JWT_SECRET)

        const idUser = decoded.idUser

        const user = await User.getById(idUser)

        return res.json(user)
    }catch(err){
        return res.status(401).json({ error: 'invalidToken' })
    }
}
