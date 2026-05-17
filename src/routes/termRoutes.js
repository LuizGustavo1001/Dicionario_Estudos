// routes to change folders, terms or meanings data
const express = require("express")
const router = express.Router()

const auth              = require("../middleware/auth")
const folderController  = require("../controller/folderController")
const termController    = require("../controller/termController")
const meaningController = require("../controller/meaningController")

module.exports = router