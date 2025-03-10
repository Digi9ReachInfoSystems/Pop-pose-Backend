const consentModel = require('../models/consentModel');

const createConsent = async (req, res) => {
    try {
        const { consent_title, consent_description } = req.body;

        const newConsent = await consentModel.create({
            consent_title,
            consent_description,
        });

        res.status(201).json({ newConsent });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({
            message: "An internal server error occurred. Please try again later.",
        });
    }
}

const getConsent = async (req, res) => {
    try {
        const consents = await consentModel.find();
        res.status(200).json({ consents });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({
            message: "An internal server error occurred. Please try again later.",
        });
    }
}

const updateConsent = async (req, res) => {
    try {
        const { id } = req.params;
        const { consent_title, consent_description } = req.body;

        const updatedConsent = await consentModel.findByIdAndUpdate(
            id,
            {
                consent_title,
                consent_description,
            },
            { new: true }
        );

        if (!updatedConsent) {
            return res.status(404).json({ message: "Consent not found" });
        }

        res.status(200).json({ consent: updatedConsent });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({
            message: "An internal server error occurred. Please try again later.",
        });
    }
}

module.exports = {
    createConsent,
    getConsent,
    updateConsent,
};
