import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(express.json());

// Configuração do Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/alexa", async (req, res) => {
    try {
        // Captura a pergunta vinda da Alexa
        const pergunta = req.body.request.intent.slots.pergunta.value;

        // Gera a resposta com o Gemini
        const result = await model.generateContent([
            "Responda de forma curta, direta e natural para ser lida em voz alta pela Alexa: ",
            pergunta
        ]);
        
        const texto = result.response.text();

        // Formato de resposta que a Alexa entende
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
        console.error("Erro:", error);
        res.json({
            version: "1.0",
            response: {
                outputSpeech: {
                    type: "PlainText",
                    text: "Desculpe, tive um problema ao consultar o Gemini."
                }
            }
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
