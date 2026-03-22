const express = require('express');
const app = express();
app.use(express.json());

const conversationHistory = {};
const SESSION_TIMEOUT = 10 * 60 * 1000;
const MAX_HISTORY = 10;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/alexa', async (req, res) => {
  const body = req.body;
  console.log('REQUEST TYPE:', body?.request?.type);
  console.log('INTENT NAME:', body?.request?.intent?.name);  // ← adiciona essa
  console.log('SLOTS:', JSON.stringify(body?.request?.intent?.slots));

  const alexaRequest = body?.request;
  const sessionId = body?.session?.sessionId || 'default';

  try {
    if (alexaRequest.type === 'LaunchRequest') {
      return res.json({
        version: '1.0',
        sessionAttributes: {},
        response: {
          outputSpeech: { type: 'PlainText', text: 'Olá... sistema online. Pode falar comigo.' },
          shouldEndSession: false,
        },
      });
    }

    if (alexaRequest.type === 'IntentRequest') {
      const userInput = alexaRequest.intent?.slots?.pergunta?.value || '';
      console.log('USER INPUT:', userInput);

      if (!userInput) {
        return res.json({
          version: '1.0',
          sessionAttributes: {},
          response: {
            outputSpeech: { type: 'PlainText', text: 'Desculpa, não entendi. Pode repetir?' },
            shouldEndSession: false,
          },
        });
      }

      if (!conversationHistory[sessionId]) {
        conversationHistory[sessionId] = { messages: [], lastActivity: Date.now() };
      }

      const timeSinceLastActivity = Date.now() - conversationHistory[sessionId].lastActivity;
      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        conversationHistory[sessionId].messages = [];
      }
      conversationHistory[sessionId].lastActivity = Date.now();

      conversationHistory[sessionId].messages.push({
        role: 'user',
        parts: [{ text: userInput }],
      });

      if (conversationHistory[sessionId].messages.length > MAX_HISTORY) {
        conversationHistory[sessionId].messages.shift();
      }

      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-BR');
      const timeStr = now.toLocaleTimeString('pt-BR');

      const systemPrompt = `Você é um assistente inteligente e amigável.
Responda sempre em português brasileiro.
Seus nomes são Alexa ou Maria.
Hoje é ${dateStr}, agora são ${timeStr}.
Seja descontraído, inteligente, direto e levemente sarcástico.
Use no máximo 2-3 frases em respostas para voz.
Otimize suas respostas para saída de voz.`;

      const geminiRes = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: conversationHistory[sessionId].messages,
        }),
      });

      const data = await geminiRes.json();
      console.log('GEMINI STATUS:', geminiRes.status);

      if (!geminiRes.ok) {
        console.error('GEMINI ERROR:', JSON.stringify(data));
        throw new Error(`Gemini ${geminiRes.status}`);
      }

      const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!responseText) {
        throw new Error('Empty response from Gemini');
      }

      conversationHistory[sessionId].messages.push({
        role: 'model',
        parts: [{ text: responseText }],
      });

      return res.json({
        version: '1.0',
        sessionAttributes: {},
        response: {
          outputSpeech: { type: 'PlainText', text: responseText },
          shouldEndSession: false,
        },
      });
    }

    res.json({
      version: '1.0',
      sessionAttributes: {},
      response: {
        outputSpeech: { type: 'PlainText', text: 'Tipo de requisição não suportado.' },
        shouldEndSession: true,
      },
    });

  } catch (error) {
    console.error('ERRO GERAL:', error.message);
    res.json({
      version: '1.0',
      sessionAttributes: {},
      response: {
        outputSpeech: { type: 'PlainText', text: 'Desculpa, ocorreu um erro ao processar sua solicitação.' },
        shouldEndSession: true,
      },
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
