import express from "express";

const app = express();
app.use(express.json());

app.post("/alexa", async (req, res) => {
    try {
        const requestType = req.body.request?.type;
        let textoResposta = "";

        if (requestType === "LaunchRequest") {
            textoResposta = "Olá Maíra e Pablo! Sou o assistente Gemini. O que desejam pesquisar agora?";
        } 
        else if (requestType === "IntentRequest") {
            const intentName = req.body.request.intent.name;
            
            if (intentName === "PerguntarGeminniIntent") {
                const pergunta = req.body.request.intent.slots.pergunta?.value;

                if (!pergunta) {
                    textoResposta = "Não consegui entender. Podem repetir?";
                } else {
                    // URL PADRÃO GOOGLE V1 (SEM BETA)
                    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
                    
                    const responseIA = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{ text: "Responda de forma curta e natural para Pablo ou Maíra: " + pergunta }]
                            }]
                        })
                    });

                    const data = await responseIA.json();
                    
                    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                        textoResposta = data.candidates[0].content.parts[0].text;
                    } else {
                        console.error("DEBUG GOOGLE:", JSON.stringify(data));
                        textoResposta = "O Google ainda está processando sua nova chave. Tente novamente em alguns minutos.";
                    }
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
                outputSpeech: { type: "PlainText", text: "Problema de conexão. Tentem de novo." }
            }
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log(`Servidor ativo na porta ${PORT}`));
