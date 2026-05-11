const express = require("express")
const router = express.Router()

const userController = require("../controller/userController")

// login
router.post("/login", userController.login)

// register user
router.post("/register", userController.register)

// auth user (JWT)
router.get("/auth", userController.auth)

// logout user
router.get("/logout", userController.logout)

module.exports = router;