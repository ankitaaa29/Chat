const express = require('express');
const { upload, uploadFile } = require('../controllers/upload.controller');

const router = express.Router();

router.post('/upload', upload.single('file'), uploadFile);

module.exports = router;
