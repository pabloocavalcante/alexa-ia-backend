import express from "express";

const app = express();
app.use(express.json());

app.post("/alexa", async (req, res) => {
    try {
        const requestType = req.body.request?.type;
        let textoResposta = "";

        if (requestType === "LaunchRequest") {
            textoResposta = "Olá Maíra e Pablo! O Gemini está pronto. O que desejam saber?";
        } 
        else if (requestType === "IntentRequest") {
            const intent = req.body.request.intent;
            const pergunta = intent?.slots?.pergunta?.value;

            if (!pergunta) {
                textoResposta = "Não entendi a pergunta. Podem repetir?";
            } else {
                // MODELO GEMINI 3.1 FLASH LITE (O MAIS NOVO DA SUA LISTA)
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${process.env.GEMINI_API_KEY}`;
                
                const responseIA = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: "Responda de forma curta e natural para Pablo ou Dra. Maíra: " + pergunta }] }]
                    })
                });

                const data = await responseIA.json();
                
                if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                    textoResposta = data.candidates[0].content.parts[0].text;
                } else {
                    console.error("DEBUG GOOGLE:", JSON.stringify(data));
                    textoResposta = "O Google retornou um erro na geração da resposta 3.1.";
                }
            }
        }

        res.json({
            version: "1.0",
            response: {
                outputSpeech: { type: "PlainText", text: textoResposta || "Como posso ajudar?" },
                shouldEndSession: false
            }
        });

    } catch (error) {
        console.error("ERRO GERAL:", error.message);
        res.json({
            version: "1.0",
            response: {
                outputSpeech: { type: "PlainText", text: "Tive um problema de conexão agora." }
            }
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log(`Servidor ativo na porta ${PORT}`));
