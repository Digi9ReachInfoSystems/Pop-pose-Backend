const express = require("express");
const app = express();

const router = express.Router();
const pageTimerController = require("../controllers/pageTimerController");
// in routes/pageTimerRoutes.js
router.post( '/pages/create', pageTimerController.createTimer );
router.get( '/pages/getAll', pageTimerController.getAllTimers );
router.put( '/pages/update/:id', pageTimerController.updateTimer );
// router.get('/pages/getByPageName/:pageName', pageTimerController.getTimerBypageName);
router.get('/pages/getByPageName', pageTimerController.getTimerByPageName);
router.delete('/pages/delete/:id', pageTimerController.deleteTimerById);
module.exports = router;
  