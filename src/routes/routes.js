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
router.post("/me/terms/:folderId", authMiddleware.protect, upload.array("images"), termController.create)
router.get("/me/terms/:idTerm", authMiddleware.protect, termController.getTermById)
router.patch("/me/terms/:idTerm/name", authMiddleware.protect, termController.updateName)

// Meanings Management
router.get("/me/meanings", authMiddleware.protect, meaningController.getByTerm)
router.post("/me/terms/:idTerm/meanings", authMiddleware.protect, upload.single('image'), meaningController.create)
router.patch("/me/terms/meanings/text/:idMeaning", authMiddleware.protect, meaningController.updateTextContent)
router.delete("/me/terms/meanings/text/:idMeaning", authMiddleware.protect, meaningController.deleteTextContent)
router.delete("/me/terms/meanings/image", authMiddleware.protect, meaningController.deleteImageContent)

module.exports = router