/**
 * Valida se a URL é de um vídeo do YouTube.
 */
function isValidYoutubeUrl(url) {
    if (!url || typeof url !== "string") return false;

    const patterns = [
        /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
        /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/[\w-]+/,
        /^(https?:\/\/)?youtu\.be\/[\w-]+/,
        /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[\w-]+/,
        /^(https?:\/\/)?m\.youtube\.com\/watch\?v=[\w-]+/,
    ];

    return patterns.some((pattern) => pattern.test(url));
}

/**
 * Formatos de arquivo válidos.
 */
const VALID_FORMATS = ["mp4", "mp3"];

/**
 * Middleware: valida body de /api/video-info
 */
function validateVideoInfoRequest(req, res, next) {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({
            error: "URL é obrigatória.",
        });
    }

    if (!isValidYoutubeUrl(url)) {
        return res.status(400).json({
            error: "URL inválida. Forneça uma URL válida do YouTube.",
        });
    }

    next();
}

/**
 * Middleware: valida body de /api/download
 */
function validateDownloadRequest(req, res, next) {
    const { url, format, quality } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL é obrigatória." });
    }

    if (!isValidYoutubeUrl(url)) {
        return res.status(400).json({
            error: "URL inválida. Forneça uma URL válida do YouTube.",
        });
    }

    if (!format || !VALID_FORMATS.includes(format)) {
        return res.status(400).json({
            error: `Formato inválido. Use um dos seguintes: ${VALID_FORMATS.join(", ")}`,
        });
    }

    if (!quality || typeof quality !== "string") {
        return res.status(400).json({
            error: "Qualidade é obrigatória.",
        });
    }

    next();
}

module.exports = {
    validateVideoInfoRequest,
    validateDownloadRequest,
};
