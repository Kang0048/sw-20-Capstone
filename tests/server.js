const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
const OpenAI = require('openai');
const path = require('path'); // 경로 처리를 위한 모듈 추가
require('dotenv').config();

const app = express();
app.use(express.json());

const openaiApiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

// HTML 파일 제공을 위한 라우트 설정
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/*app.post('/generate-prompt', async (req, res) => {
  const userInput = req.body.inputText;

  if (!userInput) {
    return res.status(400).json({ error: 'inputText가 필요합니다.' });
  }

  try {
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `The user has entered the following text: "${userInput}". Please create a detailed prompt based on this input.`,
      max_tokens: 150,
    });

    const generatedPrompt = completion.data.choices[0].text.trim();
    res.json({ prompt: generatedPrompt });
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    res.status(500).json({ error: '프롬프트 생성 중 오류가 발생했습니다.' });
  }
});*/

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
