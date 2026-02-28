function UrlInput({ url, setUrl, onFetch, loading }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && url.trim()) {
            onFetch();
        }
    };

    return (
        <div className="glass-card url-section">
            <div className="input-group">
                <input
                    id="youtube-url-input"
                    type="text"
                    className="url-input"
                    placeholder="Cole o link do YouTube aqui..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    autoComplete="off"
                />
                <button
                    id="fetch-btn"
                    className="btn btn-primary"
                    onClick={onFetch}
                    disabled={!url.trim() || loading}
                >
                    {loading ? (
                        <span className="spinner" />
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                            </svg>
                            Buscar
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export default UrlInput;
