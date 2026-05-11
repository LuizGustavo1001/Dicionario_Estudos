const express       = require("express")
const cors          = require("cors") // prevent unauthorized access to resources on web page from different origins
const path          = require("path");
const cookieParser  = require("cookie-parser")
require("dotenv").config()

const termRoutes = require("./routes/termRoutes")
const userRoutes = require("./routes/userRoutes")

const app = express()

app.use(cors(
    {
        origin: "http://localhost:8080",
        credentials: true
    }
))

app.use(cookieParser())
app.use(express.json())

// API routes
app.use("/terms", termRoutes)
app.use("/users", userRoutes)

// frontend
app.use(express.static(path.join(__dirname, "../public")));

app.listen(8080, () => {
    console.log("Server running on port 8080")
})