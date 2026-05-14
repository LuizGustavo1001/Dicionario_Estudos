const express   = require("express")
const router    = express.Router()

const auth = require("../middleware/auth")
const userController = require("../controller/userController")
const folderController = require("../controller/folderController")
const termController = require("../controller/termController")
const meaningController = require("../controller/meaningController")

// login
router.post("/login", userController.login)

// register user
router.post("/register", userController.register)

// auth user (JWT)
router.get("/auth", userController.auth)

// logout user
router.get("/logout", userController.logout)

// get user info 
router.get("/me", auth.protect, userController.me)

// user files
router.get("/me/folders", auth.protect, folderController.getUserFolders)

// folder terms
router.post("/me/folders/terms", auth.protect, termController.getFolderTerms)

router.post("/me/folders/terms/meanings", auth.protect, meaningController.getTermMeaning)

module.exports = router;