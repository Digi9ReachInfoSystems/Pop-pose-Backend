const FrameImage = require("../models/frameImageModel");

exports.createFrameImage = async (req, res) => {
    try {
        const { name, image } = req.body;
        const newFrameImage = await FrameImage.create({
            name,
            image,
        });
        res.status(201).json(newFrameImage);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllFrameImages = async (req, res) => {
    try {
        const frameImages = await FrameImage.find();
        res.status(200).json(frameImages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getFrameImageById = async (req, res) => {
    try {
        const { id } = req.params;
        const frameImage = await FrameImage.findById(id);
        if (!frameImage) {
            return res.status(404).json({ error: "Frame image not found" });
        }
        res.status(200).json(frameImage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteFrameImage = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedFrameImage = await FrameImage.findByIdAndDelete(id);
        if (!deletedFrameImage) {
            return res.status(404).json({ error: "Frame image not found" });
        }
        res.status(200).json({ message: "Frame image deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};