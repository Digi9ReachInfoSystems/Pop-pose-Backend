const { create } = require("../models/frameModel");
const userModel = require("../models/userModel");
const { storage } = require("../config/firebaseConfig");
const admin = require("firebase-admin");
const multer = require("multer");
const path = require("path");

const storageConfig = multer.memoryStorage(); // Store files in memory before uploading
const upload = multer({
  storage: storageConfig,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
}).array("images[]"); // We expect an array of images

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

const getUserForPayment = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch user and populate frame_Selection and no_of_copies fields
    const user = await userModel
      .findById(userId)
      // Populate frame_Selection with 'name'
      .populate("frame_Selection", "price image rows column index frame_size")
      .populate("no_of_copies", "Number") // Populate no_of_copies with 'name'
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send back the user with populated fields
    res.status(200).json({ user });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

const saveImages = async (req, res) => {
  // Use multer to handle file uploads from the form
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const { userId } = req.body; // Get the user ID from the request body

    if (!userId || !req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "User ID and images are required." });
    }

    try {
      // Find the user by ID
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Initialize an array to store the URLs of uploaded images
      const imageUrls = [];

      // Iterate over each image and upload it to Firebase Storage
      for (const image of req.files) {
        const fileName = `images/${Date.now()}_${image.originalname}`; // Create a unique file name

        // Upload image to Firebase Storage
        const file = storage.file(fileName);
        const stream = file.createWriteStream({
          metadata: {
            contentType: image.mimetype, // Content type from the uploaded file
          },
        });

        stream.on("error", (err) => {
          console.error("Error uploading image: ", err);
          return res.status(500).json({ message: "Error uploading image." });
        });

        // Pipe the image file to Firebase Storage
        stream.end(image.buffer); // Assuming `image` is a buffer, like in a multipart form submission

        // Once the file is uploaded, generate a signed URL (temporary URL)
        const [signedUrl] = await file.getSignedUrl({
          action: "read", // The action is "read" to allow access to the file
          expires: Date.now() + 60 * 60 * 200000, // URL expires in 1 hour
        });

        imageUrls.push(signedUrl);
      }

      // Add the image URLs to the user's image_captured array
      user.image_captured.push(...imageUrls);

      // Save the updated user document
      await user.save();

      return res
        .status(200)
        .json({ message: "Images uploaded successfully.", imageUrls });
    } catch (error) {
      console.error("Error saving images: ", error);
      return res
        .status(500)
        .json({ message: error.message || "Error saving images." });
    }
  });
};

module.exports = {
  startUserJourney,
  selectFrame,
  createNoOfCopies,
  getUserForPayment,
  saveImages,
};
