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
                    // TENTATIVA COM GEMINI-PRO (MAIOR COMPATIBILIDADE)
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;
                    
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
                        // Se der erro, vamos mostrar o erro real no log do Render
                        console.error("DEBUG GOOGLE:", JSON.stringify(data));
                        textoResposta = "Ocorreu um erro na resposta do Google. Verifiquem os logs.";
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
