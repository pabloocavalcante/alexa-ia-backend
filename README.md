# 🎙️ Alexa + Google Gemini 3.1 (Node.js Integration)

Integração entre Alexa (Amazon Echo) e a IA Google Gemini 3.1 utilizando Node.js como servidor intermediário (Webhook).

O objetivo do projeto é permitir que comandos de voz feitos na Alexa sejam processados por um modelo de IA moderno e respondidos de forma natural, direta e eficiente.

---

## 🚀 Funcionalidades

- Integração Alexa → Node.js → Google Gemini
- Uso de modelo atualizado: `gemini-3.1-flash-lite-preview`
- Respostas otimizadas para leitura em voz
- Deploy simples via Render
- Controle total da API via `fetch` nativo (sem SDK)

---

## 🧠 Problemas Resolvidos

### 1. Erro 404 (versão da API)
As bibliotecas oficiais forçam versões (`v1beta`) que podem não estar disponíveis.

**Solução:**  
Uso de `fetch` nativo → controle total da URL.

---

### 2. Mudança de modelos (1.5 → 3.1)

Modelos antigos não disponíveis para novas contas.

**Solução:**  
Script de descoberta de modelos + uso do:
gemini-3.1-flash-lite-preview

---

### 3. Timeout no Render

Deploy falhava por inicialização lenta.

**Solução:**
- Código enxuto
- Apenas `express`
- Sem dependências pesadas

---

## 🛠️ Arquitetura
Alexa → Webhook (/alexa) → Node.js → Google Gemini API → Resposta → Alexa

---

## 📦 Instalação

```bash
git clone <repo>
cd projeto
npm install

🔐 Variáveis de Ambiente
GEMINI_API_KEY=SuaChaveAqui

▶️ Executar
npm start

🌐 Deploy (Render)
	1.	Criar Web Service
	2.	Conectar ao GitHub
	3.	Adicionar variável:
	•	GEMINI_API_KEY
	4.	Porta: 10000
	5.	Start command: npm start


⸻

🎤 Configuração da Alexa
	•	Criar Intent: PerguntarGeminiIntent
	•	Slot:
		•	Nome: pergunta
		•	Tipo: AMAZON.SearchQuery
	•	Endpoint:
		•	URL do Render (/alexa)

⸻

🔗 Endpoint da API
https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent


⸻

💬 Exemplo de Uso

Usuário:
Alexa, perguntar ao Gemini: me dê uma receita de bolo

Resposta:
Receita simples de bolo…

⸻

⚠️ Limitação Atual

O sistema não mantém contexto entre perguntas.

⸻

🚀 Próximos Passos
	•	Adicionar memória de conversa
	•	Melhorar naturalidade das respostas
	•	Suporte a múltiplos usuários

---

# 🧠 **Agora o MAIS IMPORTANTE: Conversa com contexto (tipo ChatGPT)**

Hoje seu sistema **não tem memória**, então cada pergunta é isolada.

👉 Para resolver isso, você precisa guardar o histórico.

---

# ✅ **Solução: manter contexto por sessão**

## 🔥 Ideia simples

Guardar conversa em memória:

```js
const sessoes = {};


⸻

🧠 Exemplo prático

const userId = req.body.session.user.userId;

if (!sessoes[userId]) {
    sessoes[userId] = [];
}

// adiciona pergunta
sessoes[userId].push({ role: "user", text: pergunta });


⸻

🔁 Enviar histórico pro Gemini

const contents = sessoes[userId].map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
}));


⸻

🔥 Enviar para API

body: JSON.stringify({
    contents: contents
})


⸻

🧠 Salvar resposta também

sessoes[userId].push({ role: "model", text: textoResposta });


⸻

🎯 Resultado

Agora funciona assim:

👤 Pergunta 1:

me dê uma receita de bolo

🤖 Resposta:

receita…

👤 Pergunta 2:

posso trocar cenoura por laranja?

👉 Gemini entende contexto automaticamente

⸻

⚠️ Melhorias importantes

1. Limitar histórico (evitar custo alto)

if (sessoes[userId].length > 10) {
    sessoes[userId].shift();
}


⸻

2. Limpar sessão após tempo

setTimeout(() => delete sessoes[userId], 1000 * 60 * 10);


⸻

3. Melhorar prompt (deixar mais natural)

text: "Responda de forma natural, curta e conversacional: " + pergunta


⸻

🚀 Dica avançada (nível produção)

Se quiser algo realmente bom:
	•	Salvar histórico em:
	•	Redis (melhor)
	•	Banco (Mongo / Postgres)

⸻

🏁 Resumo

✔ Seu projeto já está muito bom
✔ Falta só contexto → isso muda TUDO
✔ Com isso vira praticamente um ChatGPT via Alexa

