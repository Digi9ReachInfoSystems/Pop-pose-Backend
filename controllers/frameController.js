const frameModel = require("../models/frameModel");
const Frame = require("../models/frameModel");
const { createCanvas, loadImage } = require("canvas");

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
      overlay,
      overlayRegions, // ← NEW: default false if omitted
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
      overlayRegions,
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
      overlayRegions,
      overlay,
      overlayImage,
    } = req.body;

    // Create frame document
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
      overlayRegions,
      overlay,
      overlayImage,
    });

    const savedFrame = await frame.save();

    // Generate composite frame if overlay is enabled
    if (overlay && overlayImage) {
      try {
        const compositeImageUrl = await generateCompositeFrame(savedFrame);
        // Update frame with composite image URL
        savedFrame.compositeImage = compositeImageUrl;
        await savedFrame.save();
      } catch (compositeError) {
        console.error("Error generating composite frame:", compositeError);
        // Continue even if composite generation fails
      }
    }

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

// Helper function to generate composite frame
async function generateCompositeFrame(frameData) {
  // Define canvas size based on frame size or use default
  const width = 800; // Adjust based on your requirements
  const height = 600; // Adjust based on your requirements

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 1. Draw background/empty frame
  if (frameData.background && frameData.background.length > 0) {
    const bgColor = frameData.background[0]; // Using first background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Draw frame image if available
  if (frameData.frameImage) {
    try {
      const frameImg = await loadImage(frameData.frameImage);
      ctx.drawImage(frameImg, 0, 0, width, height);
    } catch (err) {
      console.error("Error loading frame image:", err);
    }
  }

  // 3. Draw placeholders (optional - might be hidden under overlay)
  if (frameData.placeholders && frameData.placeholders.length > 0) {
    ctx.fillStyle = "rgba(200, 200, 200, 0.5)"; // Semi-transparent gray for placeholders
    frameData.placeholders.forEach((ph) => {
      ctx.beginPath();
      if (frameData.shapes === "circle") {
        ctx.arc(ph.x, ph.y, ph.width / 2, 0, Math.PI * 2);
      } else {
        ctx.rect(ph.x, ph.y, ph.width, ph.height);
      }
      ctx.fill();
    });
  }

  // 4. Draw overlay image if available
  if (frameData.overlay && frameData.overlayImage) {
    try {
      const overlayImg = await loadImage(frameData.overlayImage);
      ctx.drawImage(overlayImg, 0, 0, width, height);
    } catch (err) {
      console.error("Error loading overlay image:", err);
    }
  }

  // Save the composite image
  const uploadsDir = path.join(__dirname, "../../uploads/frames");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filename = `composite-${frameData._id}-${Date.now()}.png`;
  const filepath = path.join(uploadsDir, filename);
  const imageUrl = `/uploads/frames/${filename}`;

  const out = fs.createWriteStream(filepath);
  const stream = canvas.createPNGStream();
  stream.pipe(out);

  return new Promise((resolve, reject) => {
    out.on("finish", () => resolve(imageUrl));
    out.on("error", reject);
  });
}

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
