function FormatSelector({ format, setFormat }) {
    return (
        <div>
            <span className="section-label">Formato</span>
            <div className="format-toggle">
                <button
                    id="format-mp4"
                    className={`format-btn ${format === 'mp4' ? 'active' : ''}`}
                    onClick={() => setFormat('mp4')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
                        <rect x="2" y="6" width="14" height="12" rx="2" />
                    </svg>
                    MP4 — Vídeo
                </button>
                <button
                    id="format-mp3"
                    className={`format-btn ${format === 'mp3' ? 'active' : ''}`}
                    onClick={() => setFormat('mp3')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                    </svg>
                    MP3 — Áudio
                </button>
            </div>
        </div>
    );
}

export default FormatSelector;
