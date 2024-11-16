// dotenv 불러오기
const dotenv = require('dotenv');
const path = require('path');
// express 불러오기
const express = require("express");
// Cors 불러오기
const cors = require('cors');
// openAI 불러오기
const OpenAI = require('openai'); // OpenAI를 기본으로 가져옴
// 날씨 API
const { generateWeather } = require('../weather/app');
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
router.use(cors());

// OpenAI API를 호출하는 라우트, /generate-image 엔드포인트
router.post('/generate-APIimage', async (req, res) => {
    console.log('Request received:', req.body); // receive 확인
    try {
        // 사용자에게 받은 텍스트
        const { userKeyword, userLoc } = req.body;
        
        //날씨 API 객체 불러오기
        const weatherPrompt = await generateWeather(userLoc);

        if (!weatherPrompt) {
            return res.status(400).json({ error: 'Failed to fetch valid weather data.' });
        }

        console.log(weatherPrompt);

        let newInput;
        // 키워드를 받았을 때
        if (userKeyword != null && userKeyword.trim() !== "") {
            newInput = `Describe an outfit suitable for weather conditions with a ${weatherPrompt}.
            Focus on seasonal characteristics and ensure the outfit includes '${userKeyword}' (translated into English if needed).
            The background should match the ${weatherPrompt.sky} condition, enhancing the seasonal atmosphere.
            Ensure that your response does not exceed 700 characters.`;
        }
        // 키워드를 받지 못 했을 때
        else {
            const randomNumber = Math.floor(Math.random() * 10) + 1;

            newInput = `Please provide an English description of an outfit suitable for weather conditions with a ${weatherPrompt} weather condition and emphasizes the season. Ensure that your response does not exceed 700 characters.`;
        }
        
        console.log('Input :', newInput); // 프롬프트 로그 출력

        // 1: LLM API에 프롬프트 요청
        const response = await openai.chat.completions.create({
            model: 'gpt-4', // 모델을 gpt-4모델로 설정
            messages: [
                { role: 'system', content: "You are a fashion stylist who specializes in creating weather-appropriate outfits." },
                { role: 'user', content: newInput }
            ],
        });

        // 프롬프트 정리
        const prompt = response.choices[0].message.content.trim(); // response에서 결과 가져오기

        // 수정사항이 추가된 프롬프트
        let lastPrompt = `Create an image of a person from shoulder to end of foot. Focus only on the clothing and shoe,
        and if the face is visible, paint it black. Never put words, numbers, or text in the image. ${prompt} `

        console.log('Generated Prompt:', lastPrompt); // 프롬프트 출력
        
        
        // API에 키워드 추출 요청
        const Keyword = await openai.chat.completions.create({
            model: 'gpt-4', // 모델을 gpt-4모델로 설정
            messages: [
                { role: 'system', content: "You are a shopping mall employee and need to find the one most important fashion item in the article." },
                { role: 'user', content: `'${lastPrompt}' Please take the content in lastprompt and extract only one core fashion item word from it in Korean. Please return only one core keyword from lastprompt in Korean.` }
            ], // 키워드 단어를 추출
        });

        const AIKeyword = Keyword.choices[0].message.content.replace(/\s+/g, '');

        let keywordURL = `https://www.musinsa.com/search/goods?keyword=${AIKeyword}&keywordType=keyword&gf=A`;
        

        console.log(`${keywordURL}`);

        // 2: 이미지 생성 API에 요청
        const imageResponse = await openai.images.generate({
            prompt: lastPrompt, // 프롬프트를 JSON 형식으로 전달
            n: 4, // 생성할 이미지 수
            quality:"hd",
            size: "256x256" // 이미지 크기
        });


        // 3: 응답 처리
        // 이미지 URL 배열화
        const images = imageResponse.data.map(image => image.url);
        // 사용자에게는 이미지 URL과 크기 정보를 전달
        keywordURL = `https://www.musinsa.com/search/goods?keyword=청바지&keywordType=keyword&gf=A`
        res.json({ images: images,  keywordURL: keywordURL });
    } catch (error) {
        console.error('Error with OpenAI API request:', error.message);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

module.exports = router;