const Frame = require("../models/frameModel");

const createFrame = async (req, res) => {
  try {
    const { frame_size, price, rows, column, index, image, orientation } =
      req.body;

    const newFrame = await Frame.create({
      frame_size,
      price,
      rows,
      column,
      index,
      orientation,
      image,
    });

    res.status(201).json({ frame: newFrame });
  } catch (err) {
    console.error("Error creating frame:", err);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

const getFrames = async (req, res) => {
  try {
    const frames = await Frame.find();
    res.status(200).json({ frames });
  } catch (err) {
    console.error("Error fetching frames:", err);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

const getFrameById = async (req, res) => {
  try {
    const { id } = req.params;
    const frame = await Frame.findById(id);
    

    if (!frame) {
      return res.status(404).json({ message: "Frame not found" });
    }

    res.status(200).json({ frame });
  } catch (err) {
    console.error("Error fetching frame:", err);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

const updateFrame = async (req, res) => {
  try {
    const { id } = req.params;
    const { frame_size, price, rows, column, index, image, orientation } =
      req.body;

    const updatedFrame = await Frame.findByIdAndUpdate(
      id,
      { frame_size, price, rows, column, index, image, orientation },
      { new: true } 
    );

    if (!updatedFrame) {
      return res.status(404).json({ message: "Frame not found" });
    }

    res.status(200).json({ frame: updatedFrame });
  } catch (err) {
    console.error("Error updating frame:", err);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

const deleteFrame = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFrame = await Frame.findByIdAndDelete(id);

    if (!deletedFrame) {
      return res.status(404).json({ message: "Frame not found" });
    }

    res.status(200).json({ message: "Frame deleted successfully" });
  } catch (err) {
    console.error("Error deleting frame:", err);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

module.exports = {
  createFrame,
  getFrames,
  getFrameById,
  updateFrame,
  deleteFrame,
};
