import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/alexa", async (req, res) => {
    try {
        const requestType = req.body.request.type;
        let textoResposta = "";

        // 1. Se você apenas abrir a Skill sem perguntar nada
        if (requestType === "LaunchRequest") {
            textoResposta = "Olá Dra. Maíra! Sou seu assistente Gemini. O que deseja pesquisar hoje?";
        } 
        // 2. Se você fizer uma pergunta (Intent)
        else if (requestType === "IntentRequest") {
            const intentName = req.body.request.intent.name;
            
            if (intentName === "PerguntarGeminniIntent") {
                const pergunta = req.body.request.intent.slots.pergunta.value;

                if (!pergunta) {
                    textoResposta = "Não consegui entender a pergunta. Pode repetir?";
                } else {
                    const result = await model.generateContent([
                        "Responda de forma curta, clara e profissional para ser lida em voz alta: ",
                        pergunta
                    ]);
                    textoResposta = result.response.text();
                }
            }
        }

        // Resposta padrão para a Alexa
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
                    text: "Ocorreu um erro no servidor. Verifique os logs."
                }
            }
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
