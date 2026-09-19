import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';

const app = express();
const port = process.env.API_PORT || 3001;
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.use(express.json());
app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  response.header('Access-Control-Allow-Headers', 'Content-Type');
  response.header('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (request.method === 'OPTIONS') {
    return response.sendStatus(204);
  }

  next();
});

app.post('/api/generate-quote', async (request, response) => {
  const { keyword, language = 'English' } = request.body;
  const supportedLanguages = ['English', 'French', 'German'];

  if (!openai) {
    return response.status(500).json({ error: 'OPENAI_API_KEY가 설정되지 않았습니다.' });
  }

  if (!keyword?.trim()) {
    return response.status(400).json({ error: '키워드를 입력해주세요.' });
  }

  if (!supportedLanguages.includes(language)) {
    return response.status(400).json({ error: '지원하지 않는 언어입니다.' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a quote generator. Write the quote in ${language}. Return only JSON in the format {"text":"quote", "author":"original source"}. Create a short original quote instead of copying a famous quote.`,
        },
        {
          role: 'user',
          content: `Create one warm and memorable quote related to the keyword "${keyword.trim()}". The quote and author field must both be written in ${language}.`,
        },
      ],
    });

    const generatedQuote = JSON.parse(completion.choices[0].message.content);
    return response.json({
      id: `ai-${Date.now()}`,
      text: generatedQuote.text,
      author: generatedQuote.author,
      language,
      source: 'openai',
    });
  } catch (error) {
    console.error('OpenAI quote generation failed:', error.message);
    return response.status(500).json({ error: '명언을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.' });
  }
});

app.listen(port, () => {
  console.log(`OpenAI API server running at http://localhost:${port}`);
});
