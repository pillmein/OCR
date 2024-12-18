import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = 5000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// OpenAI 설정
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY || '', // .env 파일에서 API 키 가져오기
});


// 엔드포인트 생성
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body; // 프론트엔드에서 전달된 프롬프트
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
    });
    res.json({ content: response.choices[0].message?.content });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
