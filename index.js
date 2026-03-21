import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(express.json());

// Configuração do Gemini com API v1 para estabilidade
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
}, { apiVersion: 'v1' });

app.post("/alexa", async (req, res) => {
    try {
        const requestType = req.body.request?.type;
        let textoResposta = "";

        // 1. Boas-vindas para o casal
        if (requestType === "LaunchRequest") {
            textoResposta = "Olá Maíra e Pablo! Sou o assistente Gemini de vocês. O que desejam pesquisar agora?";
        } 
        
        // 2. Processamento da Pergunta
        else if (requestType === "IntentRequest") {
            const intentName = req.body.request.intent.name;
            
            if (intentName === "PerguntarGeminniIntent") {
                const pergunta = req.body.request.intent.slots.pergunta?.value;

                if (!pergunta) {
                    textoResposta = "Não consegui captar a pergunta. Pode repetir o que deseja saber?";
                } else {
                    // Instrução para o Gemini ser breve e atender a ambos
                    const result = await model.generateContent([
                        "Responda de forma curta e natural para ser lida em voz alta. Você está atendendo a Dra. Maíra ou ao Pablo: ",
                        pergunta
                    ]);
                    const response = await result.response;
                    textoResposta = response.text();
                }
            }
        }

        // Resposta enviada para a Alexa
        res.json({
            version: "1.0",
            response: {
                outputSpeech: {
                    type: "PlainText",
                    text: textoResposta || "Estou ouvindo, o que vocês precisam?"
                },
                shouldEndSession: false
            }
        });

    } catch (error) {
        console.error("Erro interno no servidor:", error);
        res.json({
            version: "1.0",
            response: {
                outputSpeech: {
                    type: "PlainText",
                    text: "Tive um probleminha para acessar o Google agora. Podem tentar de novo?"
                }
            }
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()
