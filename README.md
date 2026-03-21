🎙️ Alexa + Google Gemini 3.1 (Integration via Node.js)
Este projeto integra a Alexa (Amazon Echo) com a Inteligência Artificial Google Gemini 3.1, utilizando um servidor intermediário no Render para processar as requisições e contornar limitações de versões de modelos.

🚀 O que foi solucionado neste projeto?
Durante o desenvolvimento, enfrentamos e resolvemos os seguintes desafios técnicos:

1. Desvio de Versões de Modelos (Erro 404)
As bibliotecas oficiais (@google/generative-ai) muitas vezes forçam o uso de versões de API (v1beta) que podem não estar disponíveis para todas as contas.

Solução: Substituímos a biblioteca oficial por chamadas diretas via Fetch Nativo (Node.js 22+). Isso deu controle total sobre a URL de requisição.

2. Transição de Modelos (v1.5 para v3.1)
Contas novas ou contas com faturamento ativo (Tier 1) podem não ter acesso a modelos antigos como gemini-1.5-flash.

Solução: Implementamos um script de "autodescoberta" para listar os modelos permitidos pela API Key. Identificamos que o modelo estável e performático para 2026 é o gemini-3.1-flash-lite-preview.

3. Conectividade Render + Alexa
O Render exige que o servidor "acorde" e abra a porta (10000 por padrão) rapidamente, caso contrário, o deploy falha por timeout.

Solução: Otimizamos o index.js para ser leve, sem dependências externas desnecessárias (usando apenas express), garantindo um deploy rápido e estável.

🛠️ Arquitetura do Código
O servidor funciona como um Webhook:

Alexa recebe o comando de voz e envia um JSON para o /alexa.

O Node.js extrai o valor da slot (pergunta) do usuário.

O servidor faz um POST para a API do Google Gemini usando o modelo 3.1-flash-lite.

A resposta é tratada para ser curta e direta, ideal para ser lida em voz alta pela Alexa.

📋 Como Replicar
Google AI Studio: Crie sua API Key e certifique-se de que o faturamento (Billing) está configurado se pretender usar modelos Pro.

Render: * Crie um Web Service conectado ao seu GitHub.

Adicione a variável de ambiente GEMINI_API_KEY.

No deploy, use Manual Deploy > Clear build cache se encontrar erros de versão.

Alexa Developer Console:

Crie uma Intent chamada PerguntarGeminniIntent.

Adicione um slot chamado pergunta do tipo AMAZON.SearchQuery.

Configure o Endpoint para a sua URL do Render.

📝 Exemplo de Requisição (URL Utilizada)
https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=SUA_CHAVE_AQUI

Desenvolvido por Pablo Nunes (2026).
