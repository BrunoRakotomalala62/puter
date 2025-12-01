const express = require('express');
const { init } = require("@heyputer/puter.js/src/init.cjs");

const app = express();
const PORT = 5000;

const puter = init(process.env.PUTER_AUTH_TOKEN);

app.get('/puter', async (req, res) => {
  try {
    const prompt = req.query.prompt;
    
    if (!prompt) {
      return res.status(400).json({
        error: "Le paramètre 'prompt' est requis",
        example: "/puter?prompt=What is life?"
      });
    }

    const response = await puter.ai.chat(prompt, { model: "gpt-5-nano" });
    
    res.json({
      prompt: prompt,
      model: "gpt-5-nano",
      response: response
    });
    
  } catch (error) {
    res.status(500).json({
      error: "Erreur lors de la requête AI",
      message: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: "Bienvenue sur l'API Puter",
    usage: "GET /puter?prompt=votre question",
    example: "/puter?prompt=What is life?"
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur http://0.0.0.0:${PORT}`);
  console.log(`Essayez: http://localhost:${PORT}/puter?prompt=What is life?`);
});
