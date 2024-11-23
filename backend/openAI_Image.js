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
const { getWeatherData } = require('../weather/weather');
// 패션아이템
const { selectItem } = require('./selectitem');
// 시즌
const { seasonBack } = require('./seasonalprompt');

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
    console.log('이미지 전달받은 변수:', req.body); // receive 확인
    try {
        // 사용자에게 받은 텍스트
        const { userKeyword, userLoc, userGender} = req.body;

        // 날씨 데이터 가져오기
        const weatherData = await getWeatherData(userLoc); // 기본 위치는 서울

        let lastPrompt;
        let keywordURL;
        const season = weatherData.season;
        const pty = weatherData.pty;

        // 패션아이템 선정
        if(userKeyword && userKeyword != "")
        {
            const itemResponse = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are a translator from Korean to English." },
                    { role: "user", content: `Translate the following fashion item from Korean to English: ${userKeyword}. you just return one word.` }
                ],
                temperature: 0,
                max_tokens: 10,
            });

            const fashion_item = itemResponse.choices[0].message.content.trim();
            
            lastPrompt = `A ${userGender} person stands in a ${season}-themed background subtly reflecting ${season} with ${seasonBack(season)}. The ${fashion_item} is fully visible from shoulders to feet, showing both the upper and lower parts clearly, without cropping the lower half. The ${fashion_item} features realistic textures, natural folds, and precise details, with no background reflections or patterns to ensure clear separation. The clothing has a sophisticated, stylish look with a tailored fit and subtle design elements like fading, stitching, or modern accents. Soft, realistic lighting highlights the ${fashion_item}, while the background complements it without overpowering. The person's gender is reflected in the clothing style and fit, with shadows emphasizing the ${fashion_item} and making it the central focus, harmonizing with the seasonal theme.`
            keywordURL = `https://www.musinsa.com/search/goods?keyword=${userKeyword}&keywordType=keyword&gf=A`;
        }
        else  // 패션 아이템 랜덤 지정
        {
            const fashion_item = selectItem(pty, season, userGender);
            lastPrompt = `A ${userGender} person stands in a ${season}-themed background subtly reflecting ${season} with ${seasonBack(season)}. The ${fashion_item.name} is fully visible from shoulders to feet, showing both the upper and lower parts clearly, without cropping the lower half. The ${fashion_item.name} features realistic textures, natural folds, and precise details, with no background reflections or patterns to ensure clear separation. The clothing has a sophisticated, stylish look with a tailored fit and subtle design elements like fading, stitching, or modern accents. Soft, realistic lighting highlights the ${fashion_item.name}, while the background complements it without overpowering. The person's gender is reflected in the clothing style and fit, with shadows emphasizing the ${fashion_item.name} and making it the central focus, harmonizing with the seasonal theme.`
            keywordURL = `https://www.musinsa.com/search/goods?keyword=${fashion_item.ko}&keywordType=keyword&gf=A`;
        }
        
        console.log('최종 프롬프트:', lastPrompt); // 프롬프트 확인
        
        console.log(`${keywordURL}`); //URL확인

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
        res.json({ images: images,  keywordURL: keywordURL });
    } catch (error) {
        console.error('Error with OpenAI API request:', error.message);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

module.exports = router;