// dotenv 불러오기
const dotenv = require('dotenv');
const path = require('path');
// Cors 불러오기
const cors = require('cors');
// express 불러오기
const express = require("express");
// openAI 불러오기
const OpenAI = require('openai'); // OpenAI를 기본으로 가져옴


// .env 파일의 API 키를 로드 (파일 경로 지정)
dotenv.config({ path: path.resolve(__dirname, 'touch.env') });

// OpenAI API 설정
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
    console.error('OPENAI_API_KEY is missing or empty.');
    process.exit(1); // 서버 종료
}
// openai로 키 설정
const openai = new OpenAI({
    apiKey: openaiApiKey,
});
  
// express 사용
const router = express.Router();

// OpenAI API를 호출하는 라우트, /generate-image 엔드포인트
router.post('/generate-APIprompt', async (req, res) => {
    console.log('Request received:', req.body); // 요청 로그 출력

    try {
        // 사용자에게 받은 텍스트
        const { userInput } = req.body;
        // 사용자의 입력값에 더해진 새로운 입력값
        const newInput = `Please create a promotional message using "${userInput}".
        The prompt is an advertisement for a clothing shopping mall.
        Please write the results in Korean`;
                
        // 1: LLM API에 프롬프트 요청
        const response = await openai.chat.completions.create({
            model: 'gpt-4', // 모델을 gpt-4모델로 설정
            messages: [{    // newInput을 프롬프트로 사용 
                role: 'user',
                content: newInput 
            }], 
        });

        // 프롬프트 정리
        const prompt = response.choices[0].message.content.trim(); // response에서 결과 가져오기

        console.log('Generated Prompt:', prompt); // 프롬프트 출력

        // 사용자에게는 프롬프트를 전달
        res.json({ prompt : prompt});
    } catch (error) {
        console.error('Error with OpenAI API request:', error.message);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

module.exports = router;