import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';

const app = express();
const port = process.env.API_PORT || 3001;
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.use(express.json());

app.post('/api/generate-quote', async (request, response) => {
  const { keyword } = request.body;

  if (!openai) {
    return response.status(500).json({ error: 'OPENAI_API_KEY가 설정되지 않았습니다.' });
  }

  if (!keyword?.trim()) {
    return response.status(400).json({ error: '키워드를 입력해주세요.' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: '당신은 한국어 명언 생성기입니다. 반드시 JSON 형식 {"text":"명언", "author":"저자 또는 출처"}만 반환하세요. 기존 유명 명언을 그대로 복사하지 말고, 창작한 짧은 명언을 만들어주세요.',
        },
        {
          role: 'user',
          content: `키워드 "${keyword.trim()}"와 관련된 따뜻하고 기억하기 쉬운 명언을 하나 만들어주세요.`,
        },
      ],
    });

    const generatedQuote = JSON.parse(completion.choices[0].message.content);
    return response.json({
      id: `ai-${Date.now()}`,
      text: generatedQuote.text,
      author: generatedQuote.author,
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
