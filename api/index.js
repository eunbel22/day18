const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
  try {
    const { feedback } = req.body;

    if (!feedback || feedback.trim() === '') {
      return res.status(400).json({ error: '피드백을 입력해주세요' });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API 키가 설정되지 않았습니다' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `다음 고객 피드백을 분석하여 아래 계약에 따라 정확히 출력해주세요:
1. 유형: 버그 / 기능 요청 / 문의 중 하나
2. 긴급도: 높음 / 중간 / 낮음 중 하나
3. 판단 이유: 한 문장
4. 다음 행동: 한 문장

고객 피드백: ${feedback}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ result: text });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  return res.status(200).json({ status: 'ok' });
});

// 정적 파일 제공 (index.html)
app.use(express.static('.'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../index.html');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
