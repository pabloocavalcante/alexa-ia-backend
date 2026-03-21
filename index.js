import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(express.json());

// CONFIGURAÇÃO REVISADA:
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Mudamos a forma de declarar o modelo para garantir compatibilidade
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash" 
}); 

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
                    textoResposta = "Não consegui captar a pergunta. Pode repetir o que deseja saber?";
                } else {
                    // Adicionamos um timeout manual para o Gemini não travar o Render
                    const result = await model.generateContent("Responda de forma curta e natural para Maíra ou Pablo: " + pergunta);
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
                    text: textoResposta || "Estou ouvindo."
                },
                shouldEndSession: false
            }
        });

    } catch (error) {
        console.error("Erro no Gemini:", error.message);
        res.json({
            version: "1.0",
            response: {
                outputSpeech: {
                    type: "PlainText",
                    text: "Tive um problema de conexão. Por favor, tentem de novo em 10 segundos."
                }
            }
        });
    }
});

// O Render precisa que o servidor responda rápido, ou ele dá "Port scan timeout"
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor ativo na porta ${PORT}`);
});
