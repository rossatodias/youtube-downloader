const express = require("express");
const cors = require("cors");
const videoRoutes = require("./routes/videoRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"],
    })
);
app.use(express.json());

// Rotas
app.use("/api", videoRoutes);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`\n🚀 Backend rodando em http://localhost:${PORT}`);
    console.log(`📡 API disponível em http://localhost:${PORT}/api`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health\n`);
});
