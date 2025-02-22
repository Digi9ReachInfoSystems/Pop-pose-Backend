const express = require("express");
const router = express.Router();
const copies = require("../controllers/copiesController");

router.post("/add", copies.addCopies);
router.get("/", copies.getCopies);
router.delete("/:id", copies.deleteCopies);

module.exports = router;
