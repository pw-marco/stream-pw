const express = require('express');
const app = express();
const TARGET_URL = 'https://pw.studypika.eu.cc';

// Jo token aapne diya hai wahi hardcode kar diya gaya hai
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjZhOTBmNTdlNDU3NzJiY2YzNWE0NmY3MyIsImNvdW50cnlHcm91cCI6IklOIiwib3JnYW5pemF0aW9uIjp7Il9pZCI6IjVlYjM5M2VlOTVmYWI3NDY4YTc5ZDE4OSJ9LCJyb2xlcyI6WyI1YjI3YmQ5NjU4NDJmOTUwYTc3OGM2ZWYiXSwidHlwZSI6IlVTRVIiLCJ1c2VybmFtZSI6IjczMDc3MDA1MzkifSwiZXhwIjoxNzk1MjcwMjQ4LjE2MiwiaWF0IjoxNzk0NjY1NDQ4LCJqdGkiOiJ1c25EN3RVQlR4dVNycTZoQUpjb2hRXzZhOTBmNTdlNDU3NzJiY2YzNWE0NmY3MyJ9.Qy4BWu4MK8Oc8FIU-_6ryvNwuaqjiB7GduCnM-wFbQI';

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

// Proxy handler for both /api/video and /api/pw/api/video with batchId check
app.all(['/api/video', '/api/pw/api/video'], async (req, res) => {
    const batchId = req.query.batchId;

    // Agar batchId query parameter nahi hai, toh lock screen dikhao
    if (!batchId) {
        return res.status(403).send(lockedHtml);
    }

    try {
        const targetUrl = `${TARGET_URL}${req.url}`;
        
        // Request headers mein Authorization token inject karna
        const customHeaders = {
            ...req.headers,
            host: new URL(TARGET_URL).host,
            authorization: `Bearer ${AUTH_TOKEN}`
        };

        // Forward request to actual target server with token
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: customHeaders,
            body: ['GET', 'HEAD'].includes(req.method) ? undefined : req
        });

        // Copy response headers (except content-length)
        response.headers.forEach((val, key) => {
            if (key.toLowerCase() !== 'content-length') {
                res.setHeader(key, val);
            }
        });

        res.status(response.status);
        const buffer = await response.arrayBuffer();
        let bodyString = Buffer.from(buffer).toString('utf8');

        // 1. Replace domain cdn.studypika.eu.cc with cdn.physicswallah.xyz
        bodyString = bodyString.replaceAll('cdn.studypika.eu.cc', 'cdn.physicswallah.xyz');

        // 2. Try to parse JSON and append "Powered By Marco" signature safely
        try {
            let json = JSON.parse(bodyString);
            if (typeof json === 'object' && json !== null) {
                json.powered_by = "Powered By Marco";
                bodyString = JSON.stringify(json);
            }
        } catch (e) {
            // Agar response JSON nahi hai toh as it is bhej do
        }

        res.send(bodyString);
    } catch (err) {
        console.error('Proxy error:', err);
        res.status(500).send({ error: 'Proxy Gateway Error' });
    }
});

// Home page aur baaki saare routes ke liye locked message
app.use((req, res) => {
    res.status(403).send(lockedHtml);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});
