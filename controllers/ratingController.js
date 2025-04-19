const Rating = require("../models/ratingModel");


exports.createRating = async (req, res) => {
    try {
        const { feedback, rating } = req.body;
        const newRating = new Rating({ feedback, rating });
        await newRating.save();
        res.status(201).json(newRating);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRatings = async (req, res) => {
    try {
        const ratings = await Rating.find();
        res.status(200).json(ratings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.updateratingsById = async (req, res) => {
    try {
        const { id } = req.params;
        const { feedback, rating } = req.body;
        const updatedRating = await Rating.findByIdAndUpdate(id, { feedback, rating }, { new: true });
        if (!updatedRating) {
            return res.status(404).json({ error: "Rating not found" });
        }
        res.status(200).json(updatedRating);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

