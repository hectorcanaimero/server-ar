const express = require('express');
const router = express.Router();
const { upload } = require('../config/multer');
const videoController = require('../controllers/videoController');

router.post('/', upload.single('video'), videoController.optimizeVideo);

module.exports = router; 