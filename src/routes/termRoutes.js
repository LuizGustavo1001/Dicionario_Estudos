const express = require("express")
const router = express.Router()

const Term = require('../models/Term')

// creating routes
router.post("/test", async (req, res) => {
    const { term } = req.body
    const response = await Term.test(term)

    res.json(response)
})

// Get /terms
/*
router.get("/", async (req, res) => {
    const order = req.query.order || "date"

    const terms = await Term.getAll(order)

    res.json(terms)
})

// POST /terms
router.post("/", async (req, res) => {
    const { term, meaning } = req.body

    await Term.create(term, meaning)

    res.json({ status: "ok" })
})
*/

module.exports = router