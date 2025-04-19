const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');

router.post('/createRating', ratingController.createRating);
router.get('/getRatings', ratingController.getRatings);
router.put('/updateRating/:id', ratingController.updateratingsById);
module.exports = router;