const userModel = require("../models/userModel");

const startUserJourney = async (req, res) => {
  try {
    const { user_Name, phone_Number, email } = req.body;

    if (!user_Name || !phone_Number || !email) {
      return res.status(400).json({
        message: "All fields (user_Name, phone_Number, email) are required.",
      });
    }

    const user = await userModel.create({
      user_Name,
      phone_Number,
      email,
    });

    res.status(201).json({ user });
  } catch (err) {
    if (err.name === "ValidationError") {
      const validationErrors = Object.values(err.errors).map(
        (error) => error.message
      );
      return res
        .status(400)
        .json({ message: "Validation failed", errors: validationErrors });
    }

    console.error("Server error:", err);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

const updateSelectionForUser = async (req, res) => {
  try {
  } catch (err) {}
};

module.exports = { startUserJourney, updateSelectionForUser };
