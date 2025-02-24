const { create } = require("../models/frameModel");
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

const selectFrame = async (req, res) => {
  try {
    const { frameId } = req.body;
    const { userId } = req.params;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.frame_Selection = frameId;
    await user.save();

    res.status(200).json({ message: "Frame selected successfully" });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

const createNoOfCopies = async (req, res) => {
  try {
    const { numberId } = req.body;
    const { userId } = req.params;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.no_of_copies = numberId;
    await user.save();
    res.status(200).json({ message: "Copies added successfully" });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

module.exports = { startUserJourney, selectFrame, createNoOfCopies };
