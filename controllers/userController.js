const { create } = require("../models/frameModel");
const userModel = require("../models/userModel");
const { storage } = require("../config/firebaseConfig");
const admin = require("firebase-admin");
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");
const fs = require("fs");
const { uploadFileToFirebase } = require("../utilities/firebaseutility");
const { bucket } = require("../config/firebaseConfig"); // Import Firebase storage bucket

const storageConfig = multer.memoryStorage();

const upload = multer({
  storage: storageConfig,
  limits: { fileSize: 10 * 1024 * 1024 },
}).array("images[]");

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

const registerDevice = async (req, res) => {
  try {
  } catch {}
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

const provideConsent = async (req, res) => {
  try {
    const { userId } = req.params;
    const { consent } = req.body; // expects a boolean value: true or false
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update consent_Provided based on the client's input
    user.consent_Provided = consent;
    await user.save();

    res.status(200).json({
      message: `Consent has been ${
        consent ? "provided" : "revoked"
      } successfully`,
    });
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

      const imageUrls = [];

      for (const image of req.files) {
        const fileName = `images/${Date.now()}_${image.originalname}`; // Create a unique file name

        const file = storage.file(fileName);
        const stream = file.createWriteStream({
          metadata: {
            contentType: image.mimetype,
          },
        });

        stream.on("error", (err) => {
          console.error("Error uploading image: ", err);
          return res.status(500).json({ message: "Error uploading image." });
        });

        stream.end(image.buffer);

        const [signedUrl] = await file.getSignedUrl({
          action: "read",
          expires: Date.now() + 60 * 60 * 200000,
        });

        imageUrls.push(signedUrl);
      }

      user.image_captured.push(...imageUrls);

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

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel
      .find()
      .populate("frame_Selection no_of_copies")
      .exec();
    res.status(200).json({ users });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

const getImagesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ images: user.image_captured });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

const getDetailsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userModel
      .findById(userId)
      .populate("frame_Selection no_of_copies");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

const deleteImagesCapturedByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.image_captured = [];
    await user.save();
    res.status(200).json({ message: "Images deleted successfully" });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

const sendFrameToEmail = async (req, res) => {
  try {
    // Check if file and email are present in the request
    if (!req.file || !req.body.email) {
      return res.status(400).json({
        success: false,
        message: "Please provide both an image file and an email address",
      });
    }

    const { email } = req.body;
    const imageFile = req.file;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Create transporter with SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // e.g., 'smtp.yourdomain.com'
      port: process.env.SMTP_PORT || 587, // Typically 587 for TLS, 465 for SSL
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false",
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USERNAME,
      to: email,
      subject: "Your Image Attachment",
      text: "Please find your attached image.",
      attachments: [
        {
          filename: imageFile.originalname,
          content: imageFile.buffer, // Use the in-memory buffer
          contentType: imageFile.mimetype,
        },
      ],
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Image sent to email successfully",
    });
  } catch (error) {
    console.error("Error sending email:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send image to email",
      error: error.message,
    });
  }
};
const uploadToUserModel = async (userId, imageFile) => {
  try {
    if (!userId || !imageFile) {
      throw new Error("Missing userId or image file");
    }

    // Generate a unique filename
    const filename = `frame_images/${userId}_${uuidv4()}.jpg`;
    const file = bucket.file(filename);

    // Upload the image to Firebase Storage
    await file.save(imageFile.buffer, {
      metadata: {
        contentType: imageFile.mimetype,
      },
      public: true, // Make the file publicly accessible
    });

    // Get the public URL
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: "03-09-2491", // Far future date
    });

    // Update the user document in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          frame_image: url,
          updatedAt: new Date(),
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return {
      success: true,
      imageUrl: url,
      user: updatedUser,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
module.exports = {
  startUserJourney,
  selectFrame,
  createNoOfCopies,
  getUserForPayment,
  sendFrameToEmail,
  saveImages,
  getAllUsers,
  provideConsent,
  getImagesByUserId,
  getDetailsByUserId,
  deleteImagesCapturedByUserId,
};
