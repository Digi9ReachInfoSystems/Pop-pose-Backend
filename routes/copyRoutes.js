const express = require("express");
const router = express.Router();
const copies = require("../controllers/copiesController");

router.post("/add", copies.addCopies);
router.get("/getAllCopies", copies.getCopies);
router.delete("/:id", copies.deleteCopies);
router.get("/getCopiesById/:id", copies.getCopiesById);

module.exports = router;
