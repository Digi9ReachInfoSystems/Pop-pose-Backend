const frameModel = require("../models/frameModel");
const Frame = require("../models/frameModel");

// Function to generate frame layout (as defined earlier)
function generateFrameLayout(frame) {
  const { rows, columns, no_of_photos, padding, horizontal_gap, vertical_gap } =
    frame;

  // Calculate the width and height of each photo cell
  const cellWidth = (100 - (columns - 1) * horizontal_gap) / columns;
  const cellHeight = (100 - (rows - 1) * vertical_gap) / rows;

  const layout = [];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      if (i * columns + j < no_of_photos) {
        const photo = {
          x: j * (cellWidth + horizontal_gap),
          y: i * (cellHeight + vertical_gap),
          width: cellWidth,
          height: cellHeight,
        };
        layout.push(photo);
      }
    }
  }

  return layout;
}

const createFrame = async (req, res) => {
  try {
    const {
      frame_size,
      price,
      shapes,
      rows,
      columns,
      index,
      image,
      orientation,
      no_of_photos,
      background,
      padding,
      bottomPadding,
      topPadding,
      horizontal_gap,
      vertical_gap,
      is4by6,
      is2by6,
      one,
      two,
      three,
      four,
      five,
      six,
      seven,
      frameImage,
      placeholders,
      overlay = false, // ← NEW: default false if omitted
    } = req.body;

    const frame = new Frame({
      frame_size,
      price,
      shapes,
      rows,
      columns,
      index,
      image,
      orientation,
      no_of_photos,
      background,
      padding,
      bottomPadding,
      topPadding,
      horizontal_gap,
      vertical_gap,
      is4by6,
      is2by6,
      one,
      two,
      three,
      four,
      five,
      six,
      seven,
      frameImage,
      placeholders,
      overlay, // ← store it
    });

    const savedFrame = await frame.save();
    return res.status(201).json({
      message: "Frame created successfully",
      data: savedFrame,
    });
  } catch (error) {
    console.error("Error creating frame:", error);
    return res.status(500).json({
      message: "Failed to create frame",
      error: error.message,
    });
  }
};
const getFrames = async (req, res) => {
  try {
    const frames = await Frame.find()
      .populate("frameImage")

      .sort({ createdAt: -1 });
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

    // Generate layout for the frame
    const layout = generateFrameLayout(frame);

    // Add layout to the frame object
    const frameWithLayout = { ...frame.toObject(), layout };

    res.status(200).json({ frame: frameWithLayout });
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
    const {
      frame_size,
      price,
      rows,
      columns,
      index,
      image,
      orientation,
      no_of_photos,
      padding,
      horizontal_gap,
      vertical_gap,
      background,
      overlay,
      topPadding,
      bottomPadding,
      is4by6,
      is2by6,
    } = req.body;

    const updatedFrame = await Frame.findByIdAndUpdate(
      id,
      {
        frame_size,
        price,
        rows,
        columns,
        index,
        image,
        orientation,
        no_of_photos,
        padding,
        horizontal_gap,
        vertical_gap,
        background,
        overlay,
        topPadding,
        bottomPadding,
        is4by6,
        is2by6,
      },
      { new: true } // Return the updated document
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

// Delete a frame
const deleteFrame = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
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

const getImagesByFrameId = async (req, res) => {
  try {
    const { id } = req.params;
    const frame = await frameModel.findById(id).exec();
    if (!frame) {
      return res.status(404).json({ message: "Frame not found" });
    }
    res.status(200).json({ images: frame.image });
  } catch (err) {
    console.error("Error getting images:", err);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

const getBackgroundByFrameId = async (req, res) => {
  try {
    const { id } = req.params;
    const frame = await frameModel.findById(id).exec();
    if (!frame) {
      return res.status(404).json({ message: "Frame not found" });
    }
    res.status(200).json({ background: frame.background });
  } catch (err) {
    console.error("Error getting images:", err);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

const getFrameDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    const frame = await Frame.findById(id).exec();
    if (!frame) {
      return res.status(404).json({ message: "Frame not found" });
    }
    res.status(200).json({ frame });
  } catch (err) {
    console.error("Error getting frame details:", err);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

const createFrameUpdated = async (req, res) => {
  try {
    const {
      frame_size,
      price,
      shapes,
      rows,
      columns,
      index,
      image,
      orientation,
      no_of_photos,
      background,
      padding,
      bottomPadding,
      topPadding,
      horizontal_gap,
      vertical_gap,
      is4by6,
      is2by6,
      one,
      two,
      three,
      four,
      five,
      six,
      seven,
      frameImage,
      placeholders,
    } = req.body;

    const frame = new Frame({
      frame_size,
      price,
      shapes,
      rows,
      columns,
      index,
      image,
      orientation,
      no_of_photos,
      background,
      padding,
      bottomPadding,
      topPadding,
      horizontal_gap,
      vertical_gap,
      is4by6,
      is2by6,
      one,
      two,
      three,
      four,
      five,
      six,
      seven,
      frameImage,
      placeholders,
    });

    const savedFrame = await frame.save();
    return res.status(201).json({
      message: "Frame created successfully",
      data: savedFrame,
    });
  } catch (error) {
    console.error("Error creating frame:", error);
    return res.status(500).json({
      message: "Failed to create frame",
      error: error.message,
    });
  }
};
module.exports = {
  createFrame,
  getFrames,
  getFrameById,
  updateFrame,
  getFrameDetailsById,
  deleteFrame,
  createFrameUpdated,
  getImagesByFrameId,
  getBackgroundByFrameId,
};
