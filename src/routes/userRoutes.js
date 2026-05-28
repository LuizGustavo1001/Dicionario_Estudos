// General user routes
const express   = require("express")
const router    = express.Router()
const multer    = require("multer")

const authMiddleware    = require("../middleware/auth")
const userController    = require("../controller/userController")
const folderController  = require("../controller/folderController")
const termController    = require("../controller/termController")
const meaningController = require("../controller/meaningController")

const upload    = multer({ dest: "uploads/" }) // temp folder to save image before Cloudinary

// router.post("/changePassword", userController.changePassword)

router.post("/login", userController.login)

router.post("/register", userController.register)

router.post("/logout", userController.logout)

router.get("/auth", authMiddleware.protect, userController.auth)
router.post("/auth/confirmToken", authMiddleware.protect, userController.verifyToken)

router.get("/me", authMiddleware.protect, userController.me)

router.post("/me/folders/terms", authMiddleware.protect, termController.getFolderTerms)
router.post("/me/folders/terms/add", authMiddleware.protect, upload.array("images"), termController.createTerm)

router.post("/me/folders/terms/meanings", authMiddleware.protect, meaningController.getTermMeaning)
router.post("/me/folders/terms/meanings/add", authMiddleware.protect, meaningController.createMeaning)

router.get("/me/folders", authMiddleware.protect, folderController.getUserFolders)
router.post("/me/add/folder", authMiddleware.protect, folderController.createFolder)
router.post("/me/edit/folder", authMiddleware.protect, folderController.editFolder)

module.exports = router