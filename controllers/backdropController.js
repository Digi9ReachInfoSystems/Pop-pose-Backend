const backdropModel = require('../models/backdropModel');

const createBackdrop = async (req, res) => {
    try {
        const { frameId } = req.params;
        const { backdropImage, orientation } = req.body;
        const backdrop = new backdropModel({
            frameId,
            backdropImage,
            orientation
        });
        await backdrop.save();
        res.status(201).json(backdrop);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllBackgrops = async (req, res) => {
    try {
        const backdrops = await backdropModel.find();
        res.status(200).json(backdrops);
    } catch (err) {
        console.error("Server error", err);
        res.status(500).json({ message: err.message });
    }
};

const updateBackdropById = async (req, res) => {
    try {
        const { backdropId } = req.params;
        const { backdropImage } = req.body;
        const updatedBackdrop = await backdropModel.findByIdAndUpdate(
            backdropId, { backdropImage }, { new: true });
        res.status(200).json(updatedBackdrop);
    } catch (err) {
        console.error("Server error", err);
        res.status(500).json({ message: err.message });
    }
};

const deleteBackdropById = async (req, res) => {
    try {
        const { backdropId } = req.params;
        await backdropModel.findByIdAndDelete(backdropId);
        res.status(200).json({ message: "Backdrop deleted successfully" });
    } catch (err) {
        console.error("Server error", err);
        res.status(500).json({ message: err.message });
    }
    
};

module.exports = {
     createBackdrop,
     getAllBackgrops,
     updateBackdropById,
     deleteBackdropById
    };