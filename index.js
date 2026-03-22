const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: conversationHistory[sessionId].messages,
        }),
        signal: AbortSignal.timeout(10000),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Gemini API error:', JSON.stringify(data));
        throw new Error(`Gemini returned ${response.status}`);
      }

      const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (data?.candidates?.[0]?.finishReason === 'SAFETY' || !responseText) {
        return res.json({
          version: '1.0',
          sessionAttributes: {},
          response: {
            outputSpeech: { type: 'PlainText', text: 'Não consegui processar isso agora. Tente novamente.' },
            shouldEndSession: false,
          },
        });
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
    console.error('Error processing request:', error);
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
  console.log(`Alexa-Gemini server running on port ${PORT}`);
});
