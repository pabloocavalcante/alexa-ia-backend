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
            
            if (intent && intent.slots && intent.slots.pergunta && intent.slots.pergunta.value) {
                const pergunta = intent.slots.pergunta.value;
                
                // URL DE ALTA COMPATIBILIDADE PARA CONTAS PAGAS
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;
                
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
                    console.error("DEBUG GOOGLE PAGO:", JSON.stringify(data));
                    textoResposta = "O Google retornou um erro de processamento na conta paga.";
                }
            } else {
                textoResposta = "Estou ouvindo. Qual a sua pergunta?";
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
        console.error("ERRO GERAL:", error);
        res.json({
            version: "1.0",
            response: {
                outputSpeech: { type: "PlainText", text: "Erro interno de conexão. Tente novamente." }
            }
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log(`Servidor ativo na porta ${PORT}`));
