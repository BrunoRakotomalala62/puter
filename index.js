const express = require('express');
const app = express();
const PORT = 5000;

app.get('/puter', (req, res) => {
  const prompt = req.query.prompt || 'What is life?';
  
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
  </style>
</head>
<body>
  <pre id="result" class="loading">{ "status": "loading...", "prompt": "${prompt.replace(/"/g, '\\"')}" }</pre>
  <script src="https://js.puter.com/v2/"></script>
  <script>
    const prompt = decodeURIComponent("${encodeURIComponent(prompt)}");
    
    puter.ai.chat(prompt, { model: "gpt-5-nano" })
      .then(response => {
        const result = {
          prompt: prompt,
          model: "gpt-5-nano",
          response: response
        };
        document.getElementById('result').className = '';
        document.getElementById('result').textContent = JSON.stringify(result, null, 2);
      })
      .catch(error => {
        const result = {
          error: "Erreur lors de la requête AI",
          message: error.message
        };
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
    }
    .example {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    a { color: #007bff; }
  </style>
</head>
<body>
  <h1>Puter AI API</h1>
  <div class="example">
    <h3>Usage:</h3>
    <p><code>GET /puter?prompt=votre question</code></p>
    <h3>Exemple:</h3>
    <p><a href="/puter?prompt=What is life?">/puter?prompt=What is life?</a></p>
  </div>
</body>
</html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Serveur démarré sur http://0.0.0.0:' + PORT);
});
