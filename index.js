const express = require('express');
const app = express();
const PORT = 5000;

app.get('/puter', (req, res) => {
  const prompt = req.query.prompt || 'What is life?';
  const imageUrl = req.query.image_url || null;
  const uid = req.query.uid || null;
  
  const hasImage = imageUrl !== null;
  
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Puter AI API</title>
  <style>
    body {
      font-family: monospace;
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
      margin: 0;
    }
    pre {
      background: #2d2d2d;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .loading {
      color: #569cd6;
    }
    img {
      max-width: 300px;
      margin-bottom: 20px;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  ${hasImage ? `<img src="${imageUrl}" alt="Image à analyser">` : ''}
  <pre id="result" class="loading">{ "status": "loading...", "prompt": "${prompt.replace(/"/g, '\\"')}"${hasImage ? `, "image_url": "${imageUrl}"` : ''}${uid ? `, "uid": "${uid}"` : ''} }</pre>
  <script src="https://js.puter.com/v2/"></script>
  <script>
    const prompt = decodeURIComponent("${encodeURIComponent(prompt)}");
    const imageUrl = ${hasImage ? `"${imageUrl}"` : 'null'};
    const uid = ${uid ? `"${uid}"` : 'null'};
    
    let aiPromise;
    if (imageUrl) {
      aiPromise = puter.ai.chat(prompt, imageUrl, { model: "gpt-5-nano" });
    } else {
      aiPromise = puter.ai.chat(prompt, { model: "gpt-5-nano" });
    }
    
    aiPromise
      .then(response => {
        const result = {
          prompt: prompt,
          model: "gpt-5-nano",
          response: response
        };
        if (imageUrl) result.image_url = imageUrl;
        if (uid) result.uid = uid;
        
        document.getElementById('result').className = '';
        document.getElementById('result').textContent = JSON.stringify(result, null, 2);
      })
      .catch(error => {
        const result = {
          error: "Erreur lors de la requête AI",
          message: error.message
        };
        if (uid) result.uid = uid;
        document.getElementById('result').textContent = JSON.stringify(result, null, 2);
      });
  </script>
</body>
</html>
  `);
});

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Puter AI API</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 { color: #333; }
    code {
      background: #e0e0e0;
      padding: 2px 8px;
      border-radius: 4px;
      display: block;
      margin: 5px 0;
      word-break: break-all;
    }
    .example {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    a { color: #007bff; }
    h3 { margin-top: 20px; }
  </style>
</head>
<body>
  <h1>Puter AI API</h1>
  
  <div class="example">
    <h3>Chat simple:</h3>
    <code>GET /puter?prompt=votre question</code>
    <p><a href="/puter?prompt=What is life?">/puter?prompt=What is life?</a></p>
  </div>
  
  <div class="example">
    <h3>Analyse d'image:</h3>
    <code>GET /puter?prompt=description&image_url=URL&uid=ID</code>
    <p><a href="/puter?prompt=What do you see?&image_url=https://assets.puter.site/doge.jpeg&uid=123">/puter?prompt=What do you see?&image_url=https://assets.puter.site/doge.jpeg&uid=123</a></p>
  </div>
</body>
</html>
  `);
});

if (process.env.VERCEL !== '1') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('Serveur démarré sur http://0.0.0.0:' + PORT);
  });
}

module.exports = app;
