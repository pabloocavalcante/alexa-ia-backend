import express from "express";

const app = express();
app.use(express.json());

app.post("/alexa", async (req, res) => {
    try {
        const requestType = req.body.request?.type;
        let textoResposta = "";

        // 1. Boas-vindas neutras
        if (requestType === "LaunchRequest") {
            textoResposta = "Olá! O Gemini está ativo. O que deseja saber?";
        } 
        // 2. Processamento da Pergunta
        else if (requestType === "IntentRequest") {
            const intent = req.body.request.intent;
            const pergunta = intent?.slots?.pergunta?.value;

            if (!pergunta) {
                textoResposta = "Estou ouvindo. O que você gostaria de pesquisar?";
            } else {
                // MODELO 3.1 FLASH LITE (O QUE FUNCIONOU)
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${process.env.GEMINI_API_KEY}`;
                
                const responseIA = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: "Responda de forma direta, clara e curta, sem citar nomes: " + pergunta }] }]
                    })
                });

                const data = await responseIA.json();
                
                if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                    textoResposta = data.candidates[0].content.parts[0].text;
                } else {
                    textoResposta = "Desculpe, tive um problema ao processar essa resposta.";
                }
            }
        }

        // Resposta para Alexa
        res.json({
            version: "1.0",
            response: {
                outputSpeech: { type: "PlainText", text: textoResposta },
                shouldEndSession: false // Mantém aberto para você continuar perguntando
            }
        });

    } catch (error) {
        res.json({
            version: "1.0",
            response: {
                outputSpeech: { type: "PlainText", text: "Tive um problema de conexão." }
            }
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log(`Servidor ativo na porta ${PORT}`));
