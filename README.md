# Alexa + Gemini — Assistente Inteligente

Transforma a Alexa em um assistente com IA, usando o Google Gemini como cérebro. Você fala com a Alexa, ela consulta o Gemini e te responde em linguagem natural.

---

## Como funciona

Você fala → Alexa captura → Node.js envia ao Gemini → resposta volta para a Alexa falar



---

## Pré-requisitos

- Conta na [Amazon Developer Console](https://developer.amazon.com)
- Conta no [Google AI Studio](https://aistudio.google.com) para gerar a `GEMINI_API_KEY`
- Conta no [Render](https://render.com) para o deploy do servidor
- Node.js 22+

---

## 1. Configurar o servidor (Render)

1. Faça um fork ou clone deste repositório
2. No Render, crie um novo **Web Service** apontando para o repositório
3. Configure a variável de ambiente:
GEMINI_API_KEY=sua_chave_aqui


4. O servidor sobe na porta `10000` automaticamente
5. Anote a URL gerada pelo Render (ex: `https://alexa-ia.onrender.com`)

---

## 2. Criar a Skill na Amazon

1. Acesse o [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
2. Crie uma nova skill:
- **Nome:** Meu Assistente
- **Idioma:** Portuguese (BR)
- **Tipo:** Custom
- **Método de hospedagem:** Provision your own
3. Em **Invocation**, defina o nome como: `meu assistente`
4. Em **Endpoint**, selecione **HTTPS** e cole a URL do Render:
https://sua-url.onrender.com/alexa


Selecione: *My development endpoint is a sub-domain of a domain that has a wildcard certificate*

---

## 3. Configurar o Intent

1. Crie um novo Intent chamado `ConversaLivreIntent`
2. Adicione as utterances:
pesquise {pergunta}
como {pergunta}
quero saber {pergunta}
me diga {pergunta}
perguntar {pergunta}
dizer {pergunta}
falar {pergunta}
diga me {pergunta}
diga {pergunta}
o que é {pergunta}
explique {pergunta}
fale sobre {pergunta}


3. Em **Intent Slots**, adicione o slot:
- **Nome:** `pergunta`
- **Tipo:** `AMAZON.SearchQuery`
4. Clique em **Save** e depois **Build Skill**

---

## 4. Testar

No **Alexa Developer Console → Test**, habilite o modo Development e diga:

alexa meu assistente
→ "Olá... sistema online. Pode falar comigo."

me diga o que é inteligência artificial
→ resposta do Gemini



---

## Funcionalidades

- Memória de conversa por sessão (até 10 mensagens)
- Timeout de sessão de 10 minutos
- Personalidade configurável via system prompt
- Modelo: `gemini-3.1-flash-lite-preview`

---

## Stack

- **Runtime:** Node.js 22
- **Framework:** Express.js
- **IA:** Google Gemini API
- **Deploy:** Render
- **Plataforma de voz:** Amazon Alexa
