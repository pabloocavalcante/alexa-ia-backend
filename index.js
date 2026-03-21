import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(express.json());

// Forçando a versão estável da API para evitar o erro 404
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
}, { apiVersion: 'v1' }); // <--- Isso aqui mata o erro 404

app.post("/alexa", async (req, res) => {
    try {
        const requestType = req.body.request?.type;
        let textoResposta = "";

        if (requestType === "LaunchRequest") {
            textoResposta = "Olá Dra. Maíra! Sou seu assistente Gemini. O que deseja pesquisar hoje?";
        } 
        else if (requestType === "IntentRequest") {
            const intentName = req.body.request.intent.name;
            console.log("Intent recebida:", intentName); // Ver log no Render

            if (intentName === "PerguntarGeminniIntent") {
                const pergunta = req.body.request.intent.slots.pergunta?.value;
                console.log("Pergunta capturada:", pergunta); // Ver log no Render

                if (!pergunta) {
                    // Se ela não capturou a pergunta, ela pergunta de volta
                    textoResposta = "O que exatamente você gostaria de pesquisar sobre a anatomia do canal?";
                } else {
                    const result = await model.generateContent([
                        "Responda de forma curta e profissional para a Dra. Maíra: ",
                        pergunta
                    ]);
                    const response = await result.response;
                    textoResposta = response.text();
                }
            }
        }

        res.json({
            version: "1.0",
            response: {
                outputSpeech: {
                    type: "PlainText",
                    text: textoResposta || "Estou ouvindo, pode perguntar."
                },
                shouldEndSession: false
            }
        });

    } catch (error) {
        console.error("Erro detalhado:", error);
        res.json({
            version: "1.0",
            response: {
                outputSpeech: {
                    type: "PlainText",
                    text: "Tive um problema de conexão com o Google. Tente novamente em alguns segundos."
                }
            }
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
