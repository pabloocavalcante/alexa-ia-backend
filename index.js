import express from "express";

const app = express();
app.use(express.json());

app.post("/alexa", async (req, res) => {
    try {
        const requestType = req.body.request?.type;
        let textoResposta = "";

        // 1. Boas-vindas
        if (requestType === "LaunchRequest") {
            textoResposta = "Olá Maíra e Pablo! O Gemini está ativo. O que desejam saber?";
        } 
        // 2. Processamento da Pergunta (Intent)
        else if (requestType === "IntentRequest") {
            const intent = req.body.request.intent;
            
            // Verificação de segurança para não dar erro de 'undefined'
            if (intent && intent.slots && intent.slots.pergunta) {
                const pergunta = intent.slots.pergunta.value;

                if (!pergunta) {
                    textoResposta = "Não consegui captar a pergunta. Podem repetir?";
                } else {
                    // URL PARA CONTA PAGA (v1 Estável)
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
                        console.error("DEBUG GOOGLE:", JSON.stringify(data));
                        textoResposta = "O Google encontrou um erro técnico. Verifiquem o log do Render.";
                    }
                }
            } else {
                textoResposta = "Estou ouvindo, mas não entendi a pergunta.";
            }
        }

        // Resposta padrão Alexa
        res.json({
            version: "1.0",
            response: {
                outputSpeech: { type: "PlainText", text: textoResposta || "Estou à disposição." },
                shouldEndSession: false
            }
        });

    } catch (error) {
        console.error("ERRO GERAL NO SERVIDOR:", error);
        res.json({
            version: "1.0",
            response: {
                outputSpeech: { type: "PlainText", text: "Tive um problema de processamento interno. Tentem de novo." }
            }
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log(`Servidor ativo na porta ${PORT}`));
