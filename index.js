import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Ajuste do nome do modelo para evitar o erro 404
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

app.post("/alexa", async (req, res) => {
    try {
        const requestType = req.body.request.type;
        let textoResposta = "";

        if (requestType === "LaunchRequest") {
            textoResposta = "Olá Dra. Maíra! Sou seu assistente Gemini. O que deseja pesquisar hoje?";
        } 
        else if (requestType === "IntentRequest") {
            const intentName = req.body.request.intent.name;
            
            if (intentName === "PerguntarGeminniIntent") {
                const pergunta = req.body.request.intent.slots.pergunta.value;

                if (!pergunta) {
                    textoResposta = "Não consegui entender a pergunta. Pode repetir?";
                } else {
                    // Instrução para ser breve na Echo Spot
                    const result = await model.generateContent([
                        "Responda de forma curta (máximo 3 frases) e profissional para a Dra. Maíra: ",
                        pergunta
                    ]);
                    textoResposta = result.response.text();
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
        console.error("Erro interno:", error);
        res.json({
            version: "1.0",
            response: {
                outputSpeech: {
                    type: "PlainText",
                    text: "Ocorreu um erro ao acessar o Gemini. Tente novamente em instantes."
                }
            }
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
