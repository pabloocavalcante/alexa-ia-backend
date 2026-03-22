import express from "express";

const app = express();
app.use(express.json());

// 🧠 Memória por usuário
const sessoes = {};

const MAX_HISTORY = 10;
const SESSION_TIMEOUT = 1000 * 60 * 10;

app.post("/alexa", async (req, res) => {
    try {
        console.log(JSON.stringify(req.body, null, 2));

        const requestType = req.body.request?.type;
        const intentName = req.body.request?.intent?.name;
        const userId = req.body.session?.user?.userId || "anon";

        let textoResposta = "";

        // 🧠 inicia sessão
        if (!sessoes[userId]) {
            sessoes[userId] = [];
        }

        // ⏱ reset timeout
        if (sessoes[userId]._timeout) {
            clearTimeout(sessoes[userId]._timeout);
        }

        sessoes[userId]._timeout = setTimeout(() => {
            delete sessoes[userId];
        }, SESSION_TIMEOUT);

        // 🚀 ABERTURA (LaunchRequest)
        if (requestType === "LaunchRequest") {
            textoResposta = "Olá... sistema online. Pode falar comigo.";

            return res.json({
                version: "1.0",
                response: {
                    outputSpeech: { type: "PlainText", text: textoResposta },
                    shouldEndSession: false
                }
            });
        }

        // 💬 CAPTURA LIVRE (Fallback ou Intent)
        if (requestType === "IntentRequest") {

            // 🔥 tenta capturar qualquer coisa que o usuário falou
            let pergunta =
                req.body.request?.intent?.slots?.pergunta?.value ||
                req.body.request?.inputTranscript || // alguns casos
                null;

            // 🔥 fallback TOTAL (pega texto bruto da requisição)
            if (!pergunta) {
                pergunta = req.body.request?.intent?.name;
            }

            if (!pergunta || pergunta === "AMAZON.FallbackIntent") {
                textoResposta = "Pode falar, estou ouvindo.";
            } else {

                // 🧠 salva pergunta
                sessoes[userId].push({
                    role: "user",
                    text: pergunta
                });

                if (sessoes[userId].length > MAX_HISTORY) {
                    sessoes[userId].shift();
                }

                // 🧠 contexto
                const contents = sessoes[userId].map(msg => ({
                    role: msg.role,
                    parts: [{ text: msg.text }]
                }));

                // 🤖 personalidade Jarvis
                contents.unshift({
                    role: "user",
                    parts: [{
                        text: "Você é um assistente estilo Jarvis, descontraído, inteligente e direto. Responda de forma curta, natural e conversacional."
                    }]
                });

                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${process.env.GEMINI_API_KEY}`;

                const responseIA = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents })
                });

                const data = await responseIA.json();

                if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                    textoResposta = data.candidates[0].content.parts[0].text;

                    sessoes[userId].push({
                        role: "model",
                        text: textoResposta
                    });

                } else {
                    textoResposta = "Hmm... não consegui processar isso agora.";
                }
            }
        }

        res.json({
            version: "1.0",
            response: {
                outputSpeech: {
                    type: "PlainText",
                    text: textoResposta
                },
                shouldEndSession: false // 🔥 mantém conversa aberta
            }
        });

    } catch (error) {
        console.error(error);

        res.json({
            version: "1.0",
            response: {
                outputSpeech: {
                    type: "PlainText",
                    text: "Tive um problema... mas já estou voltando."
                },
                shouldEndSession: false
            }
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log(`Servidor ativo na porta ${PORT}`));
