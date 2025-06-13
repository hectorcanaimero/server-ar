const express = require('express');
const router = express.Router();
const { upload } = require('../config/multer');
const markerController = require('../controllers/markerController');

router.post('/', upload.single('image'), markerController.generateMarker);

module.exports = router; 