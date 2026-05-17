// General user routes
const express   = require("express")
const router    = express.Router()

const auth              = require("../middleware/auth")
const userController    = require("../controller/userController")
const folderController  = require("../controller/folderController")
const termController    = require("../controller/termController")
const meaningController = require("../controller/meaningController")

// auth user (JWT)
router.get("/auth", userController.auth)

router.post("/login", userController.login)

router.post("/register", userController.register)

router.get("/logout", userController.logout)

router.get("/me", auth.protect, userController.me)

router.get("/me/folders", auth.protect, folderController.getUserFolders)

router.post("/me/folders/terms", auth.protect, termController.getFolderTerms)

router.post("/me/folders/terms/meanings", auth.protect, meaningController.getTermMeaning)

module.exports = router