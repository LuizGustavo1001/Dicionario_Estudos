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

// Auth
router.post("/login", userController.login)
router.post("/register", userController.register)
router.post("/logout", userController.logout)
router.get("/me/auth", authMiddleware.protect, userController.auth)
router.post("/me/auth/confirm-token", authMiddleware.protect, userController.verifyToken)

// User Management
router.get("/me", authMiddleware.protect, userController.me)
router.delete("/me", authMiddleware.protect, userController.removeAccount)
router.patch("/me/username", authMiddleware.protect, userController.changeUsername)
router.patch("/me/password", userController.changePassword)

// Folders Management
router.get("/me/folders", authMiddleware.protect, folderController.getUserFolders)
router.post("/me/folders", authMiddleware.protect, folderController.createFolder)
router.put("/me/folders", authMiddleware.protect, folderController.editFolder)
router.delete("/me/folders", authMiddleware.protect, folderController.removeFolder)
router.post("/me/token", authMiddleware.protect, userController.newToken)

// Terms Management
router.get("/me/terms", authMiddleware.protect, termController.getFolderTerms)
router.post("/me/terms/:folderId", authMiddleware.protect, upload.array("images"), termController.createTerm)
//router.put("/me/folders/:folderId/terms", authMiddleware.protect, )
//router.delete("/me/folders/:folderId/terms", authMiddleware.protect, )

// Meanings Management
router.get("/me/meanings", authMiddleware.protect, meaningController.getTermMeanings)
router.post("/me/terms/:termId/meanings", authMiddleware.protect, meaningController.createMeaning)
//router.put("/me/terms/:termId/meanings", authMiddleware.protect,)
//router.delete("/me/terms/:termId/meanings", authMiddleware.protect,)

module.exports = router