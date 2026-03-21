import express from "express";

const app = express();
app.use(express.json());

app.post("/alexa", async (req, res) => {
    try {
        const requestType = req.body.request?.type;
        let textoResposta = "";

        if (requestType === "LaunchRequest") {
            textoResposta = "Olá Maíra e Pablo! O Gemini em nível profissional está ativo. O que desejam saber?";
        } 
        else if (requestType === "IntentRequest") {
            const pergunta = req.body.request.intent.slots.pergunta?.value;

            if (!pergunta) {
                textoResposta = "Não entendi. Podem repetir?";
            } else {
                // URL PARA NÍVEL PAGO (v1 Estável)
                const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
                
                const responseIA = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: "Responda de forma curta para Pablo ou Maíra: " + pergunta }] }]
                    })
                });

                const data = await responseIA.json();
                
                if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                    textoResposta = data.candidates[0].content.parts[0].text;
                } else {
                    console.error("DEBUG PAGO:", JSON.stringify(data));
                    textoResposta = "Houve um erro no processamento da conta paga. Verifiquem o log.";
                }
            }
        }

        res.json({
            version: "1.0",
            response: {
                outputSpeech: { type: "PlainText", text: textoResposta || "Estou ouvindo." },
                shouldEndSession: false
            }
        });

    } catch (error) {
        console.error("ERRO GERAL:", error.message);
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
