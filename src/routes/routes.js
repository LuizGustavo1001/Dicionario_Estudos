// General user routes
const express   = require("express")
const multer    = require("multer")
const router    = express.Router()

const authMiddleware    = require("../middleware/auth")
const userController    = require("../controller/userController")
const folderController  = require("../controller/folderController")
const termController    = require("../controller/termController")
const meaningController = require("../controller/meaningController")

const upload = multer({ dest: "uploads/" }) // temp folder to save image before Cloudinary

router.post("/login", userController.login)
router.post("/register", userController.register)
router.post("/logout", userController.logout)
router.get("/auth", authMiddleware.protect, userController.auth)
router.post("/auth/confirmToken", authMiddleware.protect, userController.verifyToken)

router.get("/me", authMiddleware.protect, userController.me)
router.get("/me/get/folders", authMiddleware.protect, folderController.getUserFolders)
router.post("/me/get/terms", authMiddleware.protect, termController.getFolderTerms)
router.post("/me/get/meanings", authMiddleware.protect, meaningController.getTermMeaning)

router.post("/me/add/folder", authMiddleware.protect, folderController.createFolder) 
router.post("/me/add/term", authMiddleware.protect, upload.array("images"), termController.createTerm)
router.post("/me/add/meaning", authMiddleware.protect, meaningController.createMeaning)

router.post("/me/edit/token", authMiddleware.protect, userController.newToken)
router.post("/me/edit/username", authMiddleware.protect, userController.changeUsername)
router.post("/me/edit/password", userController.changePassword)
router.post("/me/edit/folder", authMiddleware.protect, folderController.editFolder)
//router.post("/me/edit/term")
//router.post("/me/edit/meaning")

router.post("/me/remove", authMiddleware.protect, userController.removeAccount)
router.post("/me/remove/folder", authMiddleware.protect, folderController.removeFolder)
//router.post("/me/remove/term")
//router.post("/me/remove/meaning")

module.exports = router