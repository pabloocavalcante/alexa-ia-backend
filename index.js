import express from "express";

const app = express();
app.use(express.json());

app.post("/alexa", async (req, res) => {
    try {
        const requestType = req.body.request?.type;
        let textoResposta = "";

        if (requestType === "LaunchRequest") {
            textoResposta = "Olá Maíra e Pablo! O Gemini profissional está ativo. O que desejam saber?";
        } 
        else if (requestType === "IntentRequest") {
            const intent = req.body.request.intent;
            const pergunta = intent?.slots?.pergunta?.value;

            if (!pergunta) {
                textoResposta = "Não entendi a pergunta. Podem repetir?";
            } else {
                // TENTATIVA DE LISTAR OS MODELOS PARA DESCOBRIR O NOME CORRETO
                const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
                const listResponse = await fetch(listUrl);
                const listData = await listResponse.json();
                
                // Imprime a lista de modelos permitidos no log do Render
                console.log("--- MODELOS PERMITIDOS NA SUA CHAVE ---");
                console.log(JSON.stringify(listData));
                console.log("---------------------------------------");

                // Tentativa de chamada padrão
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
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
                    console.error("ERRO DO GOOGLE:", JSON.stringify(data));
                    textoResposta = "O Google deu erro de modelo. Por favor, me mande o log do Render com a lista de modelos.";
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
                outputSpeech: { type: "PlainText", text: "Erro de conexão. Tentem de novo." }
            }
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log(`Servidor ativo na porta ${PORT}`));
