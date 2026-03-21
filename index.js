import express from "express";

const app = express();
app.use(express.json());

// 🧠 Memória por usuário (sessão)
const sessoes = {};

// ⏱ Tempo de vida da sessão (10 minutos)
const SESSION_TIMEOUT = 1000 * 60 * 10;

// 📏 Limite de mensagens no histórico
const MAX_HISTORY = 10;

app.post("/alexa", async (req, res) => {
    try {
        const requestType = req.body.request?.type;
        const userId = req.body.session?.user?.userId || "anon";

        let textoResposta = "";

        // Inicializa sessão se não existir
        if (!sessoes[userId]) {
            sessoes[userId] = [];
        }

        // 🧹 Reset timer da sessão
        if (sessoes[userId]._timeout) {
            clearTimeout(sessoes[userId]._timeout);
        }

        sessoes[userId]._timeout = setTimeout(() => {
            delete sessoes[userId];
            console.log(`Sessão ${userId} removida por inatividade`);
        }, SESSION_TIMEOUT);

        // 🎙️ Boas-vindas estilo Jarvis
        if (requestType === "LaunchRequest") {
            textoResposta = "Olá. Sistema online. Pode perguntar o que quiser.";
        }

        // 💬 Processamento da pergunta
        else if (requestType === "IntentRequest") {
            const intent = req.body.request.intent;
            const pergunta = intent?.slots?.pergunta?.value;

            if (!pergunta) {
                textoResposta = "Estou ouvindo. O que deseja saber?";
            } else {

                // 🧠 Adiciona pergunta no histórico
                sessoes[userId].push({
                    role: "user",
                    text: pergunta
                });

                // 🔒 Limita histórico
                if (sessoes[userId].length > MAX_HISTORY) {
                    sessoes[userId].shift();
                }

                // 🧠 Monta contexto
                const contents = sessoes[userId].map(msg => ({
                    role: msg.role,
                    parts: [{ text: msg.text }]
                }));

                // 🤖 Prompt estilo Jarvis (descontraído)
                contents.unshift({
                    role: "user",
                    parts: [{
                        text: "Você é um assistente estilo Jarvis: descontraído, inteligente, direto e levemente sarcástico. Responda de forma curta, natural e fácil de ouvir em voz alta."
                    }]
                });

                // 🔗 URL (EXATAMENTE como você pediu)
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${process.env.GEMINI_API_KEY}`;

                const responseIA = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: contents
                    })
                });

                const data = await responseIA.json();

                if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                    textoResposta = data.candidates[0].content.parts[0].text;

                    // 🧠 Salva resposta no histórico
                    sessoes[userId].push({
                        role: "model",
                        text: textoResposta
                    });

                } else {
                    textoResposta = "Hmm... tive um pequeno problema ao processar isso.";
                }
            }
        }

        // 📤 Resposta para Alexa
        res.json({
            version: "1.0",
            response: {
                outputSpeech: {
                    type: "PlainText",
                    text: textoResposta
                },
                shouldEndSession: false
            }
        });

    } catch (error) {
        console.error(error);

        res.json({
            version: "1.0",
            response: {
                outputSpeech: {
                    type: "PlainText",
                    text: "Algo deu errado na conexão. Mas estou tentando me recuperar."
                },
                shouldEndSession: false
            }
        });
    }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor ativo na porta ${PORT}`);
});
