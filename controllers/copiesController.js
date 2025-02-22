const copiesModel = require("../models/noofCopiesModel");

const addCopies = async (req, res) => {
  try {
    const { Number } = req.body;
    const newCopies = await copiesModel.create({ Number }); // Rename the variable here
    res.status(201).json({ newCopies });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

const getCopies = async (req, res) => {
  try {
    const copies = await copiesModel.find();
    res.status(200).json({ copies });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

const deleteCopies = async (req, res) => {
  try {
    const { id } = req.params; // Assuming the ID is passed as a route parameter
    const deletedCopies = await copiesModel.findByIdAndDelete(id);
    if (!deletedCopies) {
      return res.status(404).json({ message: "Copies not found" });
    }
    res.status(200).json({ message: "Copies deleted successfully" });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

module.exports = { addCopies, getCopies, deleteCopies };
