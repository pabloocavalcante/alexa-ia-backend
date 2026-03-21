import express from "express";

const app = express();
app.use(express.json());

app.post("/alexa", async (req, res) => {
    try {
        const requestType = req.body.request?.type;
        let textoResposta = "";

        if (requestType === "LaunchRequest") {
            textoResposta = "Olá Maíra e Pablo! O assistente Gemini está pronto. O que desejam saber?";
        } 
        else if (requestType === "IntentRequest") {
            const pergunta = req.body.request.intent.slots.pergunta?.value;

            if (!pergunta) {
                textoResposta = "Não entendi a pergunta. Podem repetir?";
            } else {
                // TENTATIVA 1: O NOME PADRÃO QUE DEVERIA FUNCIONAR
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
                
                const responseIA = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: "Responda curto para Pablo ou Maíra: " + pergunta }] }]
                    })
                });

                const data = await responseIA.json();
                
                if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                    textoResposta = data.candidates[0].content.parts[0].text;
                } else {
                    // SE DER ERRO 404, VAMOS LISTAR OS MODELOS DISPONÍVEIS NO LOG
                    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
                    const listResponse = await fetch(listUrl);
                    const listData = await listResponse.json();
                    
                    console.log("--- MODELOS DISPONÍVEIS NA SUA CHAVE ---");
                    console.log(JSON.stringify(listData));
                    console.log("---------------------------------------");
                    
                    textoResposta = "O Google deu um erro de modelo. Olhe o log do Render para ver a lista permitida.";
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
