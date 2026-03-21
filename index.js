import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/alexa", async (req, res) => {
    try {
        const pergunta = req.body.request.intent.slots.pergunta.value;

        const respostaIA = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Responda de forma curta e clara, como se estivesse falando." },
                    { role: "user", content: pergunta }
                ]
            })
        });

        const data = await respostaIA.json();
        const texto = data.choices[0].message.content;

        res.json({
            version: "1.0",
            response: {
                outputSpeech: {
                    type: "PlainText",
                    text: texto
                },
                shouldEndSession: false
            }
        });

    } catch (error) {
        res.json({
            version: "1.0",
            response: {
                outputSpeech: {
                    type: "PlainText",
                    text: "Erro ao processar sua pergunta."
                }
            }
        });
    }
});

app.listen(3000, () => console.log("Servidor rodando"));
