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

        let fashion_item;
        let lastPrompt;
        let keywordURL
        const season = "spring";
        const pty = weatherData.pty;

        // 패션아이템 선정
        if(userKeyword && userKeyword != ""){
            fashion_item = userKeyword;
            lastPrompt = `A person standing in a ${season}-themed background with ${pty} conditions. The background should clearly reflect the unique characteristics of ${season} (e.g., bright colors and sunlight for summer, golden tones for autumn, snowy and cold scenery for winter). The person is wearing a ${fashion_item} that is the focal point of the image. The clothing should appear highly realistic, with detailed textures and lifelike design, making the ${fashion_item} stand out. The person is positioned so that the ${fashion_item} is fully visible from shoulders to feet. The image should have vibrant colors, with realistic lighting that enhances the textures and designs of the clothing and accessories. Focus on making the fashion item look stylish and visually appealing within the seasonal context.`
            keywordURL = `https://www.musinsa.com/search/goods?keyword=${fashion_item}&keywordType=keyword&gf=A`;
        }else{ // 패션 아이템 랜덤 지정
            fashion_item = selectItem(pty, season, userGender);
            lastPrompt = `A ${season}-themed background with ${pty} conditions. A ${userGender} wearing ${fashion_item.name} is present in the scene. The background reflects the characteristics of ${season}. The person is stylishly dressed, with the ${fashion_item.name} being a focal point in the scene. The clothing and accessories should appear highly realistic, showcasing detailed textures and lifelike design. Images should have vibrant colors, realistic textures, and a high level of detail about the clothing. This person must stand so that the fashion item in question is clearly visible from shoulders to feet.`
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