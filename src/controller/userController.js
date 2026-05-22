const bcrypt    = require("bcrypt")
const crypto    = require('crypto')
const JWT       = require("jsonwebtoken")
const db        = require("../database/connection")

const User      = require("../models/User")
const Folder    = require("../models/Folder")
const Term      = require("../models/Term")

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
    const payload = JWT.sign(
        {
            idUser: user.idUser,
            tokenConfirmed: (!user.tokenConfirmed) ? false : true
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" } // 30 days long sessions
    )

    res.cookie("token", payload, { // HTTPOnly cookie
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 30
    })

    return res.status(201).json({ message: "loginSuccess" })
}

exports.register = async (req, res) => {
    const { username, password } = req.body

    const user = await User.getByName(username)
    if(user){ return res.status(409).json({ error: "userExists" }) }
    
    const connection = await db.getConnection() // execute db queries only when every query can be executed => using transactions

    try{
        await connection.beginTransaction() 

        const hashed = await bcrypt.hash(password, 10)

        const addUser = await User.create(connection, username, hashed)

        const exampleFolder = await Folder.create(connection, addUser)

        const exampleTerm = await Term.create(connection, exampleFolder)

        const exampleMeaning = await Term.insertMeaning(connection, exampleTerm)

        await connection.commit()

        return res.status(201).json({ message: "userCreated" })
    }catch(err){
        await connection.rollback()
        console.log(err)
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

    const connection = await db.getConnection()

    try{ // decode token
        const decoded = JWT.verify(token, process.env.JWT_SECRET)
        const idUser = decoded.idUser

        await connection.beginTransaction()

        const userRow = await User.getTokenStatusById(connection, idUser)

        if(!userRow){
            await connection.rollback()
            return res.status(401).json({ error: "invalidUser" })
        }

        // user already confirmed token
        if(userRow.tokenConfirmed === 1 || userRow.tokenConfirmed === true){
            await connection.commit()

            return res.json({
                authenticated: true,
                status: "confirmed",
                user: decoded
            })
        } 

        // pending token confirmation -> generate new token + update dabase 
        const newRawToken = crypto.randomBytes(8).toString('hex').toUpperCase()
        const saltRounds = 10
        const hashedToken = await bcrypt.hash(newRawToken, saltRounds)

        await User.updateRecoveryToken(connection, idUser, hashedToken)

        await connection.commit()

        res.cookie("display_token", newRawToken, {
            maxAge: 60000, // 60s
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        })

        return res.json({
            authenticated: true,
            status: "pending_confirmation",
            user: decoded
        })
    }catch(err){
        await connection.rollback()
        console.log(err)
        return res.status(401).json({ error: "invalidToken" })
    }finally{
        connection.release()
    }
}

exports.logout = (req, res) => {
    res.clearCookie("token")

    return res.json({ success: true })
}

exports.me = async (req, res) => {
    try{
        const idUser = req.userId

        const user = await User.getById(idUser)

        if(!user){
            return res.status(404).json({ error: "userNotFound" })
        }

        if(user.tokenConfirmed === 0 || user.tokenConfirmed === false){
            return res.status(401).json({ error: "tokenNotConfirmed" })
        }

        delete user.password

        return res.json(user)
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'internalServerError' })
    }
}

// verify input token while changing password
exports.changePassword = async (req, res) => {
    const { username, typedToken, newPassword } = req.body

    const connection = await db.getConnection()

    try{
        await connection.beginTransaction() 

        // retrieve user token at dabatase
        const user = await User.getTokenByName(connection, userId)

        if(!user.recoveryToken){
            await connection.rollback()
            return res.status(400).json({ error: "tokenNotFound" })
        }

        const tokenMatch = await bcrypt.compare(typedToken, user.recoveryToken)

        if(!tokenMatch){
            await connection.rollback()
            return res.status(400).json({ error: "incorretToken" })
        }

        // update password and generate new token
        const newHashedPassword = await bcrypt.hash(newPassword, 10)

        const newRawToken = crypto.randomBytes(8).toString('hex').toUpperCase()
        const saltRounds = 10
        const hashedToken = await bcrypt.hash(newRawToken, saltRounds)

        await User.updatePassword(connection, newHashedPassword, hashedToken, user.idUser)

        await connection.commit()

        return res.status(201).json({ message: "passwordChanged" })
    }catch(err){
        await connection.rollback()
        console.log(err)
        return res.status(400).json({ error: "dberror" })
    }finally{
        connection.release()
    }
}

// verify input token confirmation at /auth/confirmToken
exports.verifyToken = async (req, res) => {
    const { typedToken } = req.body

    const idUser = req.userId

    const connection = await db.getConnection()

    try{
        await connection.beginTransaction()

        const userData = await User.getTokenById(connection, idUser)

        const tokenMatch = await bcrypt.compare(typedToken, userData.token)

        if(!tokenMatch){
            await connection.rollback()
            return res.status(400).json({ error: "incorretToken" })
        }

        await User.updateTokenStatus(connection, idUser)

        // new JWT -> token confirmed
        await connection.commit()
        const newPayload = JWT.sign({
                idUser: idUser,
                tokenConfirmed: true 
            },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        )

        // overwrite old JWT
        res.cookie("token", newPayload, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 30
        })

        return res.status(201).json({ message: "tokenVerified" }) 
    }catch(err){
        await connection.rollback()
        console.log(err)
        return res.status(400).json({ error: "dberror" })
    }finally{
        connection.release()
    }
}
