import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/alexa", async (req, res) => {
    try {
        const requestType = req.body.request?.type;
        let textoResposta = "";

        if (requestType === "LaunchRequest") {
            textoResposta = "Olá Maíra e Pablo! Sou o assistente Gemini de vocês. O que desejam pesquisar agora?";
        } 
        else if (requestType === "IntentRequest") {
            const intentName = req.body.request.intent.name;
            
            if (intentName === "PerguntarGeminniIntent") {
                const pergunta = req.body.request.intent.slots.pergunta?.value;

                if (!pergunta) {
                    textoResposta = "Não consegui captar a pergunta. Pode repetir?";
                } else {
                    // CHAMADA DIRETA PARA A API DO GOOGLE (SEM BIBLIOTECA)
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
                    
                    const responseIA = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: "Responda de forma curta para Pablo ou Maíra: " + pergunta }] }]
                        })
                    });

                    const data = await responseIA.json();
                    
                    if (data.candidates && data.candidates[0].content.parts[0].text) {
                        textoResposta = data.candidates[0].content.parts[0].text;
                    } else {
                        console.error("Erro na estrutura do Google:", data);
                        textoResposta = "O Google recebeu a pergunta, mas não conseguiu gerar uma resposta agora.";
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
        console.error("Erro Geral:", error.message);
        res.json({
            version: "1.0",
            response: {
                outputSpeech: { type: "PlainText", text: "Tive um problema de conexão. Tentem de novo em 10 segundos." }
            }
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log(`Servidor ativo na porta ${PORT}`));
