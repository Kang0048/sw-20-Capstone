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
// express 사용
const app = express();
// 포트번호 설정
const port = 5000;
app.use(cors()); 

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
    console.log('Request received:', req.body); // 요청 로그 출력

    try {
        // 사용자에게 받은 텍스트
        const { userInput } = req.body; // userInput에서 입력값을 가져옴
        const newInput = userInput + "make prompt in english";
        console.log('Prompt received:', newInput); // 프롬프트 로그 출력

        
        /*
        * 프롬프트 스타일, 요구사항 덧붙이기
        * 프롬프트를 영어로 출력해달라고 덧붙이기
        */
        

        // 1: LLM API에 프롬프트 요청
        const response = await openai.chat.completions.create({
            model: 'gpt-4', // 모델을 chat API로 변경
            messages: [{ role: 'user', content: newInput }], // userInput을 프롬프트로 사용
        });

        // 프롬프트 정리
        const prompt = response.choices[0].message.content.trim(); // response에서 결과 가져오기
        // 수정사항이 추가된 프롬프트
        const lastPrompt = prompt + "If you're going to enter letters, just enter numbers."
        console.log('Generated Prompt:', lastPrompt); // 프롬프트 출력


        // 2: 이미지 생성 API에 요청
        const imageResponse = await openai.images.generate({
            prompt: lastPrompt, // 프롬프트를 JSON 형식으로 전달
            n: 4, // 생성할 이미지 수
            quality:"standard", //
            size: "256x256" // 이미지 크기
        });

        // 3: 응답 처리
        // 이미지 URL 배열화
        const images = imageResponse.data.map(image => image.url);
        // 사용자에게는 이미지 URL만 전달
        res.json({ images: images });
    } catch (error) {
        console.error('Error with OpenAI API request:', error.message);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

// http 실행
app.listen(port, () => {
    console.log(`서버가 정상적으로 실행되었습니다.`);
});
