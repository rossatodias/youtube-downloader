const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");

// Caminho do yt-dlp no venv Python do projeto
const YT_DLP_PATH = path.resolve(__dirname, "../../.venv/bin/yt-dlp");

// Args comuns para resiliência
const COMMON_ARGS = [
    "--user-agent",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "--retries", "3",
    "--no-check-certificates",
];

/**
 * Executa yt-dlp com argumentos e retorna stdout parseado como JSON.
 */
function runYtDlpJson(args) {
    return new Promise((resolve, reject) => {
        execFile(
            YT_DLP_PATH,
            args,
            { maxBuffer: 10 * 1024 * 1024 },
            (error, stdout, stderr) => {
                if (error) {
                    const msg = stderr || error.message;
                    reject(new Error(msg));
                    return;
                }
                try {
                    resolve(JSON.parse(stdout));
                } catch {
                    reject(new Error("Falha ao parsear resposta do yt-dlp."));
                }
            }
        );
    });
}

/**
 * Executa yt-dlp para baixar arquivo. Retorna Promise que resolve com o caminho do arquivo.
 */
function runYtDlpDownload(args) {
    return new Promise((resolve, reject) => {
        execFile(
            YT_DLP_PATH,
            args,
            { maxBuffer: 10 * 1024 * 1024, timeout: 5 * 60 * 1000 },
            (error, stdout, stderr) => {
                if (error) {
                    const msg = stderr || error.message;
                    reject(new Error(msg));
                    return;
                }
                resolve({ stdout, stderr });
            }
        );
    });
}

/**
 * Busca informações de um vídeo do YouTube e agrupa os formatos disponíveis.
 * @param {string} url - URL do vídeo
 * @returns {Promise<Object>} - metadados + qualidades por formato
 */
async function getVideoInfo(url) {
    const info = await runYtDlpJson([
        ...COMMON_ARGS,
        "--dump-json",
        "--no-download",
        "--no-warnings",
        url,
    ]);

    const { title, duration, thumbnail, id: videoId, formats } = info;

    // Agrupa qualidades de vídeo — aceita qualquer container com vcodec válido
    const videoQualities = new Map();
    for (const f of formats || []) {
        const hasVideo = f.vcodec && f.vcodec !== "none";
        if (hasVideo && f.height) {
            const label = `${f.height}p`;
            const currentBest = videoQualities.get(label);
            if (!currentBest || (f.tbr || 0) > (currentBest.tbr || 0)) {
                videoQualities.set(label, {
                    quality: label,
                    height: f.height,
                    formatId: f.format_id,
                    hasAudio: f.acodec && f.acodec !== "none",
                    tbr: f.tbr || 0,
                    ext: f.ext,
                    filesize: f.filesize || f.filesize_approx || null,
                });
            }
        }
    }

    // Agrupa qualidades de áudio
    const audioQualities = new Map();
    for (const f of formats || []) {
        const isAudioOnly =
            f.acodec &&
            f.acodec !== "none" &&
            (!f.vcodec || f.vcodec === "none");
        if (isAudioOnly) {
            const abr = f.abr || f.tbr || 0;
            const label = `${Math.round(abr)}kbps`;
            const currentBest = audioQualities.get(label);
            if (!currentBest || abr > (currentBest.abr || 0)) {
                audioQualities.set(label, {
                    quality: label,
                    abr: Math.round(abr),
                    formatId: f.format_id,
                    ext: f.ext,
                    filesize: f.filesize || f.filesize_approx || null,
                });
            }
        }
    }

    // Ordena do maior pro menor
    const sortedVideo = [...videoQualities.values()].sort(
        (a, b) => b.height - a.height
    );
    const sortedAudio = [...audioQualities.values()]
        .filter((a) => a.abr > 0)
        .sort((a, b) => b.abr - a.abr);

    return {
        videoId,
        title,
        duration: duration || 0,
        thumbnail,
        qualities: {
            mp4: sortedVideo,
            mp3: sortedAudio,
        },
    };
}

/**
 * Valida se o formato e qualidade solicitados existem nos metadados do vídeo.
 */
async function validateAndGetFormat(url, format, quality) {
    const info = await getVideoInfo(url);

    const pool = format === "mp4" ? info.qualities.mp4 : info.qualities.mp3;
    const matched = pool.find((q) => q.quality === quality);

    if (!matched) {
        return {
            valid: false,
            error: `Qualidade "${quality}" não disponível para o formato "${format}" neste vídeo.`,
        };
    }

    return {
        valid: true,
        formatId: matched.formatId,
        title: info.title,
        filesize: matched.filesize,
        height: matched.height,
    };
}

/**
 * Baixa vídeo/áudio para um arquivo temporário e retorna o caminho.
 * Para mp4: usa bestvideo+bestaudio com merge.
 * Para mp3: usa o formatId direto.
 * @returns {Promise<{filePath: string, cleanup: Function}>}
 */
async function downloadToTempFile(url, format, formatId, height) {
    const tmpId = crypto.randomBytes(8).toString("hex");
    const ext = format === "mp3" ? "m4a" : "mp4";
    const tmpFile = path.join(os.tmpdir(), `ytdl_${tmpId}.${ext}`);

    let formatSpec;
    if (format === "mp4") {
        // Usa o formatId específico validado + melhor áudio,
        // com fallback para o formatId sozinho ou best geral
        formatSpec = `${formatId}+bestaudio/${formatId}/best`;
    } else {
        formatSpec = formatId;
    }

    const args = [
        ...COMMON_ARGS,
        "-f", formatSpec,
        "-o", tmpFile,
        "--no-warnings",
        "--no-part",
        "--no-playlist",
    ];

    if (format === "mp4") {
        args.push("--merge-output-format", "mp4");
    }

    args.push(url);

    console.log(`[yt-dlp] Downloading to ${tmpFile}...`);
    await runYtDlpDownload(args);
    console.log(`[yt-dlp] Download complete: ${tmpFile}`);

    return {
        filePath: tmpFile,
        cleanup: () => {
            fs.unlink(tmpFile, (err) => {
                if (err && err.code !== "ENOENT") {
                    console.error("Erro ao limpar arquivo temporário:", err.message);
                }
            });
        },
    };
}

module.exports = {
    getVideoInfo,
    validateAndGetFormat,
    downloadToTempFile,
};
