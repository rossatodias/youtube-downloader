const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");
const {
    validateVideoInfoRequest,
    validateDownloadRequest,
} = require("../middleware/validator");

// POST /api/video-info — busca metadados e qualidades disponíveis
router.post("/video-info", validateVideoInfoRequest, videoController.handleGetInfo);

// POST /api/download — valida e faz download
router.post("/download", validateDownloadRequest, videoController.handleDownload);

module.exports = router;
