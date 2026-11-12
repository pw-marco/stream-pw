const express = require('express');
const app = express();
const TARGET_URL = 'https://cdn.physicswallah.xyz';

// Locked HTML Response
const lockedHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>API Locked</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; background: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; text-align: center; }
        .card { background: #1e293b; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); max-width: 400px; width: 90%; }
        h2 { color: #ef4444; margin-bottom: 15px; }
        p { margin: 10px 0; font-size: 15px; color: #cbd5e1; }
        a { color: #38bdf8; text-decoration: none; }
    </style>
</head>
<body>
    <div class="card">
        <h2>API IS LOCKED</h2>
        <p>Contact Owner to use this API</p>
        <p><strong>Owner Telegram I'd:</strong> <a href="https://t.me/officialmarco22" target="_blank">@officialmarco22</a></p>
        <p><strong>Owner Telegram Channel:</strong> <a href="https://t.me/official_marco_22" target="_blank">@official_marco_22</a></p>
    </div>
</body>
</html>
`;

// Proxy handler specifically for /api/video with batchId check
app.all('/api/video', async (req, res) => {
    const batchId = req.query.batchId;

    // Agar batchId query parameter nahi hai, toh lock screen dikhao
    if (!batchId) {
        return res.status(403).send(lockedHtml);
    }

    try {
        const targetUrl = `${TARGET_URL}${req.url}`;
        
        // Forward request to actual target server
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                ...req.headers,
                host: new URL(TARGET_URL).host
            },
            body: ['GET', 'HEAD'].includes(req.method) ? undefined : req
        });

        // Copy response headers
        response.headers.forEach((val, key) => {
            res.setHeader(key, val);
        });

        res.status(response.status);
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
    } catch (err) {
        console.error('Proxy error:', err);
        res.status(500).send({ error: 'Proxy Gateway Error' });
    }
});

// Home page aur baaki saare routes ke liye locked message
app.use((req, res) => {
    res.status(403).send(lockedLogs = lockedHtml);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});
