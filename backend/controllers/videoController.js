const fs = require("fs");
const youtubeService = require("../services/youtubeService");

/**
 * POST video-info — busca metadados e qualidades disponíveis.
 */
async function handleGetInfo(req, res) {
    try {
        const { url } = req.body;
        const videoInfo = await youtubeService.getVideoInfo(url);

        return res.json({
            success: true,
            data: videoInfo,
        });
    } catch (error) {
        console.error("Erro ao buscar informações do vídeo:", error.message);

        if (
            error.message.includes("Video unavailable") ||
            error.message.includes("is not available")
        ) {
            return res.status(404).json({
                success: false,
                error: "Vídeo não encontrado ou indisponível.",
            });
        }

        return res.status(500).json({
            success: false,
            error: "Erro ao buscar informações do vídeo. Tente novamente.",
        });
    }
}

/**
 * POST download — valida formato/qualidade, baixa para temp file e faz streaming.
 */
async function handleDownload(req, res) {
    let cleanup = null;

    try {
        const { url, format, quality } = req.body;

        // Validação silenciosa: re-busca info e confere se formato/qualidade existem
        const validation = await youtubeService.validateAndGetFormat(
            url,
            format,
            quality
        );

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error,
            });
        }

        // Baixa para arquivo temporário
        const download = await youtubeService.downloadToTempFile(
            url,
            format,
            validation.formatId,
            validation.height
        );
        cleanup = download.cleanup;

        // Obtém tamanho real do arquivo baixado
        const stat = fs.statSync(download.filePath);

        // Monta o nome de arquivo seguro
        const title = (validation.title || "video")
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "_")
            .substring(0, 100);

        const extension = format === "mp3" ? "m4a" : "mp4";
        const filename = `${title}.${extension}`;

        // Configura headers para download do arquivo
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );
        res.setHeader(
            "Content-Type",
            format === "mp3" ? "audio/mpeg" : "video/mp4"
        );
        res.setHeader("Content-Length", stat.size);

        // Faz stream do arquivo temporário para o cliente
        const fileStream = fs.createReadStream(download.filePath);

        fileStream.on("end", () => {
            if (cleanup) cleanup();
        });

        fileStream.on("error", (error) => {
            console.error("Erro ao enviar arquivo:", error.message);
            if (cleanup) cleanup();
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: "Erro durante o download. Tente novamente.",
                });
            }
        });

        fileStream.pipe(res);
    } catch (error) {
        console.error("Erro ao processar download:", error.message);
        if (cleanup) cleanup();

        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                error: "Erro ao processar download. Tente novamente.",
            });
        }
    }
}

module.exports = {
    handleGetInfo,
    handleDownload,
};
