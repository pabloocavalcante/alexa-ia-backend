🎙️ Alexa + Google Gemini (Modo Assistente / Jarvis)

🚀 Objetivo

Transformar a Alexa em um assistente inteligente (tipo ChatGPT/Jarvis), com:
	•	Conversa contínua
	•	Memória de contexto
	•	Respostas naturais via Google Gemini

⸻

🧠 Como funciona
	1.	Alexa recebe sua fala
	2.	Envia para um servidor Node.js (/alexa)
	3.	O servidor chama o Gemini (API)
	4.	A resposta volta e é lida pela Alexa

⸻

⚙️ Configuração da Alexa

Invocation Name

meu assistente


⸻

Intent obrigatória (captura de fala)

Nome:

ConversaLivreIntent

Sample Utterances:

falar {pergunta}
dizer {pergunta}
perguntar {pergunta}
me diga {pergunta}
quero saber {pergunta}

Slot:
	•	Nome: pergunta
	•	Tipo: AMAZON.SearchQuery

⸻

Intent adicional (importante)

Ativar:

AMAZON.FallbackIntent

👉 Não precisa configurar nada nela

⸻

💻 Backend (Node.js)
	•	Framework: Express
	•	Endpoint: /alexa
	•	Porta: 10000 (Render)

Variável de ambiente:

GEMINI_API_KEY= SUA_CHAVE


⸻

🔗 API utilizada

https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent


⸻

🧠 Recursos implementados
	•	Memória por usuário (contexto)
	•	Timeout de sessão (10 min)
	•	Histórico limitado (10 mensagens)
	•	Personalidade estilo “Jarvis”

⸻

🎤 Como usar

Ativação:

Alexa, meu assistente

Perguntas:

Alexa, meu assistente, falar tem jogo hoje?
Alexa, meu assistente, me diga uma receita


⸻

⚠️ Importante
	•	Alexa NÃO aceita fala 100% livre
	•	Sempre precisa de uma frase como:
	•	“falar”
	•	“me diga”
	•	Isso é limitação da própria Alexa

⸻

🏁 Resultado

✔ Conversa contínua
✔ Respostas inteligentes
✔ Contexto entre perguntas
✔ Experiência tipo ChatGPT

⸻

🚀 Melhorias futuras
	•	SSML (voz mais natural)
	•	Memória persistente (banco)
	•	Integração com APIs externas
	•	Personalização por usuário

⸻

📦 Deploy

Recomendado:
	•	Render (Web Service)
	•	Node.js 22+
	•	Deploy leve (apenas express)

⸻

Pronto! 🎉
Sua Alexa agora funciona como um assistente inteligente.
:::
