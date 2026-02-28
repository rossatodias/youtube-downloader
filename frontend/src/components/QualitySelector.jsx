function QualitySelector({ qualities, quality, setQuality, format }) {
    const options = format === 'mp4' ? qualities.mp4 : qualities.mp3;

    if (!options || options.length === 0) {
        return (
            <div>
                <span className="section-label">Qualidade</span>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                    Nenhuma qualidade disponível para este formato.
                </p>
            </div>
        );
    }

    return (
        <div>
            <span className="section-label">Qualidade</span>
            <select
                id="quality-select"
                className="quality-select"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
            >
                <option value="">Selecione a qualidade</option>
                {options.map((q) => (
                    <option key={q.quality} value={q.quality}>
                        {q.quality}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default QualitySelector;
