// dotenv 불러오기
const dotenv = require('dotenv');
const path = require('path');
// express 불러오기
const express = require("express");
// openAI 불러오기
const OpenAI = require('openai'); // OpenAI를 기본으로 가져옴

// .env 파일의 API 키를 로드 (파일 경로 지정)
dotenv.config({ path: path.resolve(__dirname, 'touch.env') });
// express 사용
const app = express();
// 포트번호 설정
const port = 5000;


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
  
// JSON 형식의 요청 본문(body)을 처리
app.use(express.json());
  
// OpenAI API를 호출하는 라우트, /generate-image 엔드포인트
app.post('/generate-image', async (req, res) => {
    try {
        // 사용자에게 받은 텍스트
        const { userInput } = req.body;

        /* 
        * 사용자에게 받은 스타일, 요구사항들을 텍스트에 추가해야하는 부분
        * 프롬프트엔지니어링을 통해
        * 원하는 형태의 프롬프트를 만들어 낼 수 있는 텍스트로 만들어야함
        * ex) 텍스트 + (웅장한 이미지로 만들기 위한 문장 + 텍스트를 제거하는 문장)
        */

        // 1: LLM API에 프롬프트 요청
        // OpenAI API에 POST 요청을 보내는 부분
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // 모델을 chat API로 변경
            messages: [{ role: 'user', content: prompt }],
        });

        // 프롬프트 정리
        const prompt = llmResponse.choices[0].message.content.trim();

        // 2: 이미지 생성 API에 요청
        const imageResponse = await openai.images.generate({
            prompt: prompt, // 프롬프트를 JSON 형식으로 전달
            n: 4, // 생성할 이미지 수
            size: "1024x1024" // 이미지 크기
        });

        // 3: 응답 처리
        // 이미지 url 배열화
        const images = imageResponse.data.map(image => image.url);
        // 사용자에게는 이미지 URL만 전달
        res.json({ images: images });
    } catch (error) {
        console.error('Error with OpenAI API request:', error.message);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

// http 실행 -> 여기서 텍스트를 받고, 출력하는 부분을 작성해서 송수신이 되는지 확인해야함
app.listen(port, () => {
    console.log(`서버가 정상적으로 실행되었습니다.`);
});