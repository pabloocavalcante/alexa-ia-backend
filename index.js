import express from "express";

const app = express();
app.use(express.json());

// 🧠 Memória por usuário
const sessoes = {};

// ⏱ Tempo de vida da sessão (10 minutos)
const SESSION_TIMEOUT = 1000 * 60 * 10;

// 📏 Limite de histórico
const MAX_HISTORY = 10;

app.post("/alexa", async (req, res) => {
    try {
        console.log("REQUEST:", JSON.stringify(req.body, null, 2));

        const requestType = req.body.request?.type;
        const intentName = req.body.request?.intent?.name;
        const userId = req.body.session?.user?.userId || "anon";

        let textoResposta = "";

        // 🧠 Inicializa sessão
        if (!sessoes[userId]) {
            sessoes[userId] = [];
        }

        // ⏱ Reset timeout
        if (sessoes[userId]._timeout) {
            clearTimeout(sessoes[userId]._timeout);
        }

        sessoes[userId]._timeout = setTimeout(() => {
            delete sessoes[userId];
            console.log(`Sessão ${userId} removida`);
        }, SESSION_TIMEOUT);

        // 🎙️ Abertura estilo Jarvis
        if (requestType === "LaunchRequest") {
            textoResposta = "Olá... sistema online. Pode falar comigo.";
        }

        // 💬 Conversa livre
        else if (requestType === "IntentRequest") {

            // 🔥 CAPTURA REAL DA FALA (ESSENCIAL)
            let pergunta = req.body.request?.inputTranscript;

            // fallback (caso não venha inputTranscript)
            if (!pergunta) {
                pergunta = req.body.request?.intent?.slots?.pergunta?.value;
            }

            // fallback final
            if (!pergunta || intentName === "AMAZON.FallbackIntent") {
                pergunta = req.body.request?.inputTranscript;
            }

            console.log("FALA CAPTURADA:", pergunta);

            if (!pergunta) {
                textoResposta = "Pode falar, estou ouvindo.";
            } else {

                // 🧠 Salva pergunta
                sessoes[userId].push({
                    role: "user",
                    text: pergunta
                });

                if (sessoes[userId].length > MAX_HISTORY) {
                    sessoes[userId].shift();
                }

                // 🧠 Monta contexto
                const contents = [
                    {
                        role: "user",
                        parts: [{
                            text: "Você é um assistente estilo Jarvis: descontraído, inteligente, direto, levemente sarcástico e com respostas curtas ideais para voz."
                        }]
                    },
                    ...sessoes[userId].map(msg => ({
                        role: msg.role,
                        parts: [{ text: msg.text }]
                    }))
                ];

                // 🔗 URL (mantida exatamente como você pediu)
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${process.env.GEMINI_API_KEY}`;

                const responseIA = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents })
                });

                const data = await responseIA.json();

                if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                    textoResposta = data.candidates[0].content.parts[0].text;

                    // 🧠 salva resposta
                    sessoes[userId].push({
                        role: "model",
                        text: textoResposta
                    });

                } else {
                    textoResposta = "Hmm... não consegui pensar em uma resposta agora.";
                }
            }
        }

        // 📤 resposta Alexa
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

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor ativo na porta ${PORT}`);
});
