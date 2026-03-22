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
        else if (requestType === "IntentRequest" || requestType === "SessionResumedRequest") {

            // 🔥 Captura robusta da fala
            let pergunta =
                req.body.request?.intent?.slots?.pergunta?.value ||
                req.body.request?.inputTranscript ||
                null;

            if (!pergunta || intentName === "AMAZON.FallbackIntent") {
                pergunta = req.body.request?.inputTranscript;
            }

            console.log("FALA CAPTURADA:", pergunta);

            if (!pergunta) {
                textoResposta = "Pode falar, estou ouvindo.";
            } else {

                // 🧠 Salva pergunta no histórico local
                sessoes[userId].push({
                    role: "user",
                    text: pergunta
                });

                if (sessoes[userId].length > MAX_HISTORY) {
                    sessoes[userId].shift();
                }

                // 🕒 Data e hora atual
                const agora = new Date();
                const dataAtual = agora.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long", year: "numeric", month: "long", day: "numeric" });
                const horaAtual = agora.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });

                // 🧠 Monta o corpo da requisição para o Gemini
                const systemInstruction = `Você é um assistente estilo Jarvis: descontraído, inteligente, direto e levemente sarcástico. Respostas curtas para voz. Caso precise, hoje é ${dataAtual}, agora são ${horaAtual}.`;

                const contents = sessoes[userId].map(msg => ({
                    role: msg.role === "model" ? "model" : "user",
                    parts: [{ text: msg.text }]
                }));

                // Adiciona a instrução de sistema como a primeira mensagem de usuário (melhor compatibilidade)
                contents.unshift({
                    role: "user",
                    parts: [{ text: `[INSTRUÇÃO DE SISTEMA]: ${systemInstruction}` }]
                });

                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

                const responseIA = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents })
                });

                const data = await responseIA.json();

                // 🛡️ Validação robusta da resposta (Evita o erro de 'undefined')
                const candidate = data.candidates?.[0];
                const responseText = candidate?.content?.parts?.[0]?.text;

                if (responseText) {
                    textoResposta = responseText;

                    // 🧠 Salva resposta da IA no histórico
                    sessoes[userId].push({
                        role: "model",
                        text: textoResposta
                    });
                } else {
                    // Verifica se foi bloqueado por segurança
                    if (data.promptFeedback?.blockReason) {
                        textoResposta = "Minhas diretrizes de segurança me impedem de responder isso.";
                    } else {
                        textoResposta = "Tive um pequeno lapso de memória agora. Pode repetir?";
                    }
                    console.error("Erro na resposta do Gemini:", JSON.stringify(data));
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
                shouldEndSession: false
            }
        });

    } catch (error) {
        console.error("ERRO CRÍTICO:", error);
        res.json({
            version: "1.0",
            response: {
                outputSpeech: {
                    type: "PlainText",
                    text: "Sistemas instáveis. Tente novamente em um instante."
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
