# 🎬 YouTube Downloader

Aplicação web para download de vídeos e áudios do YouTube. Interface moderna em React com backend Node.js/Express que utiliza o [yt-dlp](https://github.com/yt-dlp/yt-dlp) como engine de download.

![Stack](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Stack](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Stack](https://img.shields.io/badge/yt--dlp-FF0000?logo=youtube&logoColor=white)

## ✨ Funcionalidades

- 🔍 Busca metadados do vídeo (título, thumbnail, duração)
- 🎥 Download em MP4 — múltiplas resoluções (144p até 4K)
- 🎵 Download em MP3 — múltiplos bitrates
- 🎨 Interface dark mode com glassmorphism
- ✅ Validação de URL e formatos no servidor
- 📱 Layout responsivo (mobile-friendly)

## 📁 Estrutura do Projeto

```
YoutubeDownloader/
├── backend/
│   ├── server.js              # Servidor Express (porta 3001)
│   ├── routes/videoRoutes.js   # Rotas da API
│   ├── controllers/videoController.js
│   ├── services/youtubeService.js  # Integração com yt-dlp
│   └── middleware/validator.js     # Validação de requests
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Componente principal
│   │   ├── App.css            # Estilos dos componentes
│   │   ├── index.css          # Design system (dark mode)
│   │   └── components/
│   │       ├── UrlInput.jsx
│   │       ├── VideoPreview.jsx
│   │       ├── FormatSelector.jsx
│   │       ├── QualitySelector.jsx
│   │       └── DownloadButton.jsx
│   ├── vite.config.js         # Proxy /api → backend:3001
│   └── index.html
└── README.md
```

## 🚀 Tutorial — Rodando do Zero (Ubuntu)

### Pré-requisitos

```bash
# Node.js 18+ (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Python 3.10+ e pip (geralmente já vem no Ubuntu)
sudo apt install -y python3 python3-venv python3-pip

# FFmpeg (necessário para merge de vídeo + áudio)
sudo apt install -y ffmpeg
```

### 1. Clonar o repositório

```bash
git clone https://github.com/rossatodias/youtube-downloader.git
cd youtube-downloader
```

### 2. Configurar o Python (yt-dlp)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install yt-dlp
```

### 3. Instalar dependências do Backend

```bash
cd backend
npm install
cd ..
```

### 4. Instalar dependências do Frontend

```bash
cd frontend
npm install
cd ..
```

### 5. Iniciar a aplicação

Abra **dois terminais** na raiz do projeto:

**Terminal 1 — Backend:**
```bash
node backend/server.js
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
```

### 6. Acessar

Abra o navegador em **http://localhost:5173** 🎉

## 🔌 API

| Rota | Método | Body | Descrição |
|------|--------|------|-----------|
| `/api/video-info` | POST | `{ "url": "..." }` | Retorna metadados + qualidades |
| `/api/download` | POST | `{ "url": "...", "format": "mp4", "quality": "720p" }` | Faz download do arquivo |
| `/health` | GET | — | Health check do servidor |

## 🛠️ Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Frontend | React + Vite |
| Estilo | Vanilla CSS (dark mode, glassmorphism) |
| Backend | Node.js + Express |
| Download Engine | yt-dlp (via child_process) |
| Merge A/V | FFmpeg |

## 📝 Notas

- O yt-dlp é atualizado com frequência. Se downloads falharem, atualize:
  ```bash
  source .venv/bin/activate && pip install --upgrade yt-dlp
  ```
- Vídeos muito longos ou em alta resolução podem demorar para baixar
- O frontend usa proxy do Vite em dev — em produção, configure um proxy reverso (nginx)
