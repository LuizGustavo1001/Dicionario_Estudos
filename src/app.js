const express       = require("express")
const cors          = require("cors") // prevent unauthorized access to resources on web page from different origins
const path          = require("path")
const cookieParser  = require("cookie-parser")

const port = 8080

require("dotenv").config()

const routes = require("./routes/routes.js")

const app = express()

app.use(cors(
    {
        origin: `http://localhost:${port}`,
        credentials: true
    }
))

app.use(cookieParser())
app.use(express.json())

// API routes
app.use("/api", routes)

// frontend
app.use(express.static(path.join(__dirname, "../public")))

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})