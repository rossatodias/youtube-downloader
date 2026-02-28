import { useState } from 'react';
import './App.css';
import UrlInput from './components/UrlInput';
import VideoPreview from './components/VideoPreview';
import FormatSelector from './components/FormatSelector';
import QualitySelector from './components/QualitySelector';
import DownloadButton from './components/DownloadButton';

function App() {
  const [url, setUrl] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Busca informações do vídeo na API
  const handleFetchInfo = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setSuccess('');
    setVideoData(null);
    setQuality('');

    try {
      const response = await fetch('/api/video-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar informações do vídeo.');
      }

      setVideoData(data.data);

      // Seleciona primeira qualidade disponível automaticamente
      const qualities = format === 'mp4' ? data.data.qualities.mp4 : data.data.qualities.mp3;
      if (qualities && qualities.length > 0) {
        setQuality(qualities[0].quality);
      }
    } catch (err) {
      setError(err.message || 'Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Atualiza qualidade ao trocar formato
  const handleFormatChange = (newFormat) => {
    setFormat(newFormat);
    setQuality('');

    if (videoData) {
      const qualities = newFormat === 'mp4' ? videoData.qualities.mp4 : videoData.qualities.mp3;
      if (qualities && qualities.length > 0) {
        setQuality(qualities[0].quality);
      }
    }
  };

  // Faz o download
  const handleDownload = async () => {
    if (!url.trim() || !format || !quality) return;

    setDownloading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          format,
          quality,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao baixar o arquivo.');
      }

      // Extrai o nome do arquivo do header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `video.${format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+?)"?$/);
        if (match) filename = match[1];
      }

      // Cria blob e faz download no navegador
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);

      setSuccess('Download concluído com sucesso!');
    } catch (err) {
      setError(err.message || 'Erro ao baixar o arquivo.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="app-title">YouTube Downloader</h1>
        <p className="app-subtitle">Baixe vídeos e áudios do YouTube com facilidade</p>
      </header>

      {/* URL Input */}
      <UrlInput
        url={url}
        setUrl={setUrl}
        onFetch={handleFetchInfo}
        loading={loading}
      />

      {/* Erro */}
      {error && (
        <div className="error-message" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Sucesso */}
      {success && (
        <div className="success-message" role="status">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {success}
        </div>
      )}

      {/* Skeleton Loading */}
      {loading && (
        <div className="glass-card preview-section">
          <div className="video-preview">
            <div className="skeleton skeleton-thumb" />
            <div className="video-info">
              <div className="skeleton skeleton-text" style={{ width: '90%' }} />
              <div className="skeleton skeleton-text" style={{ width: '70%' }} />
              <div className="skeleton skeleton-text-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Video Preview */}
      {videoData && !loading && (
        <>
          <VideoPreview videoData={videoData} />

          {/* Options: Format + Quality */}
          <div className="glass-card options-section">
            <FormatSelector format={format} setFormat={handleFormatChange} />
            <QualitySelector
              qualities={videoData.qualities}
              quality={quality}
              setQuality={setQuality}
              format={format}
            />
          </div>

          {/* Download Button */}
          <div className="download-section">
            <DownloadButton
              onClick={handleDownload}
              disabled={!quality}
              downloading={downloading}
            />

            {downloading && (
              <div className="progress-wrapper">
                <div className="progress-label">
                  <span>Baixando...</span>
                  <span>Aguarde</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '100%' }} />
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>YouTube Downloader &bull; Desenvolvido com React + Express</p>
      </footer>
    </div>
  );
}

export default App;
