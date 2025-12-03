const express = require('express');
const { fal } = require('@fal-ai/client');
const app = express();
const PORT = 5000;

const API_KEY = process.env.API_KEY;
const FAL_KEY = process.env.FAL_KEY;

if (FAL_KEY) {
  fal.config({ credentials: FAL_KEY });
}

app.get('/fal/edit', async (req, res) => {
  const imageUrl = req.query.image || null;
  const prompt = req.query.prompt || 'Edit this image';
  const uid = req.query.uid || null;

  if (!FAL_KEY) {
    return res.json({
      error: "FAL_KEY not configured",
      message: "Please set the FAL_KEY environment variable with your Fal.ai API key"
    });
  }

  if (!imageUrl) {
    return res.json({
      error: "Image URL required",
      message: "Please provide an image URL using ?image=URL"
    });
  }

  try {
    const result = await fal.subscribe("fal-ai/nano-banana/edit", {
      input: {
        prompt: prompt,
        image_url: imageUrl
      }
    });

    const response = {
      prompt: prompt,
      model: "nano-banana/edit",
      provider: "fal.ai",
      image_url: imageUrl
    };

    if (uid) response.uid = uid;

    if (result.data && result.data.images && result.data.images[0]) {
      response.output_url = result.data.images[0].url;
      response.output = result.data.images;
    } else {
      response.output = result.data || result;
    }

    res.json(response);

  } catch (error) {
    const result = {
      error: "Erreur lors de l'édition Fal.ai",
      message: error.message
    };
    if (uid) result.uid = uid;
    res.json(result);
  }
});

app.get('/fal/generate', async (req, res) => {
  const prompt = req.query.prompt || 'A beautiful landscape';
  const uid = req.query.uid || null;

  if (!FAL_KEY) {
    return res.json({
      error: "FAL_KEY not configured",
      message: "Please set the FAL_KEY environment variable with your Fal.ai API key"
    });
  }

  try {
    const result = await fal.subscribe("fal-ai/nano-banana", {
      input: {
        prompt: prompt
      }
    });

    const response = {
      prompt: prompt,
      model: "nano-banana",
      provider: "fal.ai"
    };

    if (uid) response.uid = uid;

    if (result.data && result.data.images && result.data.images[0]) {
      response.output_url = result.data.images[0].url;
      response.output = result.data.images;
    } else {
      response.output = result.data || result;
    }

    res.json(response);

  } catch (error) {
    const result = {
      error: "Erreur lors de la génération Fal.ai",
      message: error.message
    };
    if (uid) result.uid = uid;
    res.json(result);
  }
});

app.get('/gpt', async (req, res) => {
  const imageUrl = req.query.image || null;
  const prompt = req.query.prompt || 'Describe this image';
  const uid = req.query.uid || null;

  if (!API_KEY) {
    return res.json({
      error: "API_KEY not configured",
      message: "Please set the API_KEY environment variable with your LaoZhang.ai API key"
    });
  }

  try {
    const content = [
      {
        type: "text",
        text: prompt
      }
    ];

    if (imageUrl) {
      content.push({
        type: "image_url",
        image_url: {
          url: imageUrl
        }
      });
    }

    const response = await fetch('https://api.laozhang.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        stream: false,
        messages: [
          {
            role: 'user',
            content: content
          }
        ]
      })
    });

    const data = await response.json();

    const result = {
      prompt: prompt,
      model: "gpt-image-1",
      provider: "laozhang.ai"
    };

    if (imageUrl) result.image_url = imageUrl;
    if (uid) result.uid = uid;

    if (data.error) {
      result.error = data.error;
    } else if (data.choices && data.choices[0]) {
      result.response = data.choices[0].message?.content || data.choices[0];
    } else {
      result.response = data;
    }

    res.json(result);

  } catch (error) {
    const result = {
      error: "Erreur lors de la requête GPT-Image-1",
      message: error.message
    };
    if (uid) result.uid = uid;
    res.json(result);
  }
});

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
  <title>AI API Hub</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 { color: #333; }
    h2 { color: #555; margin-top: 40px; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
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
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-left: 10px;
    }
    .badge-free { background: #28a745; color: white; }
    .badge-api { background: #6c757d; color: white; }
    .badge-edit { background: #dc3545; color: white; }
  </style>
</head>
<body>
  <h1>AI API Hub</h1>

  <h2>Fal.ai - Nano Banana <span class="badge badge-edit">Image Editing</span></h2>
  
  <div class="example">
    <h3>Edition d'image (Image-to-Image):</h3>
    <code>GET /fal/edit?image=URL_IMAGE&prompt=modification</code>
    <p><a href="/fal/edit?image=https://assets.puter.site/doge.jpeg&prompt=Make the dog wear sunglasses">/fal/edit?image=...&prompt=Make the dog wear sunglasses</a></p>
    <p><small>Changez le fond, les vetements, ajoutez des elements...</small></p>
  </div>
  
  <div class="example">
    <h3>Generation d'image (Text-to-Image):</h3>
    <code>GET /fal/generate?prompt=description</code>
    <p><a href="/fal/generate?prompt=A beautiful sunset over the ocean">/fal/generate?prompt=A beautiful sunset over the ocean</a></p>
  </div>
  
  <h2>GPT-Image-1 (LaoZhang.ai) <span class="badge badge-api">API Key Required</span></h2>
  
  <div class="example">
    <h3>Analyse d'image avec GPT:</h3>
    <code>GET /gpt?image=URL_IMAGE&prompt=votre question</code>
    <p><a href="/gpt?image=https://assets.puter.site/doge.jpeg&prompt=What do you see in this image?">/gpt?image=https://assets.puter.site/doge.jpeg&prompt=What do you see?</a></p>
  </div>
  
  <div class="example">
    <h3>Generation de texte avec GPT:</h3>
    <code>GET /gpt?prompt=votre question</code>
    <p><a href="/gpt?prompt=What is artificial intelligence?">/gpt?prompt=What is artificial intelligence?</a></p>
  </div>

  <h2>Puter AI <span class="badge badge-free">Free</span></h2>
  
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
