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

const session = require('express-session');
// .env 파일의 API 키를 로드 (파일 경로 지정)
dotenv.config({ path: path.resolve(__dirname, 'touch.env') });

const app = express();
app.use(
  session({
    secret: 'your-secret-key', // 세션 암호화 키
    resave: false, // 세션을 항상 저장할지 여부
    saveUninitialized: true, // 초기화되지 않은 세션을 저장할지 여부
    cookie: {
      secure: false, // HTTPS를 사용하는 경우 true로 설정
      maxAge: 180000, // 쿠키 유효 기간 (밀리초, 1분)
    },
  })
);

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

const fixPrompt = async (originalPrompt, userFix) => {
    console.log('수정사항 실행중');
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `
            You are a prompt editor. Your primary task is to modify the given prompt by incorporating the user's additional requests as accurately as possible while maintaining the original context and style.
            Ensure the image contains no text. The final prompt must be concise, clear, and under 1000 characters.
            Always prioritize the user's fix requests while ensuring grammatical accuracy and coherence.
          `,
        },
        {
          role: 'user',
          content: `
            Original Prompt: "${originalPrompt}"
            User Fix Requests: "${userFix}"
          `,
        },
      ],
    });
  
    return response.choices[0].message.content.trim();
};


// OpenAI API를 호출하는 라우트, /generate-image 엔드포인트
router.post('/generate-APIimage', async (req, res) => {
    console.log('이미지 전달받은 변수:', req.body); // receive 확인
    try {
        // 사용자에게 받은 텍스트
        const { userKeyword, userLoc, userGender, InputFix} = req.body;

        // 날씨 데이터 가져오기
        const weatherData = await getWeatherData(userLoc); // 기본 위치는 서울

        if (!req.session.lastPrompt) {
            req.session.lastPrompt = '';
            console.log('Initializing lastPrompt in session');
        }
        let keywordURL;
        const season = weatherData.season;
        const pty = weatherData.pty;
        
        if (InputFix && req.session.lastPrompt != '') {
            const previousPrompt = req.session.lastPrompt;
            if (!previousPrompt) {
              return res
                .status(400)
                .json({ error: 'No previous prompt found in session.' });
            }
            prompt = await fixPrompt(previousPrompt, InputFix);
            req.session.lastPrompt = prompt;
        } else{
            // 패션아이템 선정
            req.session.lastPrompt = '';
            if(userKeyword && userKeyword != "")
            {
                const itemResponse = await openai.chat.completions.create({
                    model: "gpt-4",
                    messages: [
                        { role: "system", content: "You are a translator from Korean to English."},
                        { role: "user", content: `Translate the following fashion item from Korean to English: ${userKeyword}. you just return one word.` }
                    ],
                    temperature: 0,
                    max_tokens: 10,
                });

                const fashion_item = itemResponse.choices[0].message.content.trim();
                
                req.session.lastPrompt = `A ${userGender} person stands at the center of the frame in a ${season}-themed background featuring ${seasonBack(season)}. The focus is on the ${fashion_item}, styled with complementary clothing to create a cohesive, fashionable outfit. The entire outfit, including the ${fashion_item}, is fully visible from shoulders to feet, ensuring no part of the body is cropped or obscured. The ${fashion_item} and the rest of the ensemble are rendered with realistic textures, natural folds, and intricate details for a true-to-life representation. The clothing highlights a sophisticated, stylish design with tailored fits and modern accents like fading, stitching, or subtle patterns. The seasonal background adds depth and harmonizes with the outfit without overpowering it. Shadows enhance the form, ensuring the ${fashion_item} remains the centerpiece, while the full outfit emphasizes style and balance in the ${season} theme.`;
                keywordURL = `https://www.musinsa.com/search/goods?keyword=${userKeyword}&keywordType=keyword&gf=A`;
            }
            else  // 패션 아이템 랜덤 지정
            {
                const fashion_item = selectItem(pty, season, userGender);
                const response = await openai.chat.completions.create({
                    model: 'gpt-4-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: `
                            You are a professional fashion assistant specializing in creating hyper-realistic and stylized digital art prompts for a fashion image generation AI.
                            Your task is to describe the outfit and its components in rich detail, including materials, colors, and their suitability for the given season, weather, and gender. 
                            Ensure the background reflects the given season and weather, but do not include the background description in the fashion item details. The background should be a separate focus in the prompt, and not integrated into the description of the outfit.
                            The image should not include any faces. Ensure that the model's face is obscured or turned away, so no facial features are visible in the generated image.
                            Example Prompt: "A male figure is centered in the frame against a winter backdrop, featuring a snow-covered ground, sparse bare tree branches, and a serene mist. The model is positioned to ensure no facial features are visible, facing away or obscured. He wears a thick, textured corduroy jacket in a deep forest green, tailored to offer a snug, yet comfortable fit ideal for winter temperatures. The jacket features large buttons and patch pockets that enhance its utility and style. Underneath, he layers with a charcoal grey wool sweater and a crisp white shirt visible at the collar. His ensemble is completed with dark denim jeans and sturdy, lace-up leather boots in black, suitable for the snowy setting. The outfit is meticulously detailed to show realistic textures, like the ridges on the corduroy and the softness of the wool, ensuring the fashion items remain the focal point against the subtle, wintry background."
                            The prompt must remain concise and under 1000 characters, ensuring there is no text in the generated image.`
                        },            
                        {
                            role: 'user',
                            content: `
                            Generate a fashion image prompt using:
                            Season: ${season}.
                            Weather: ${pty}.
                            fashionitem: ${fashion_item.name}
                            background: ${seasonBack(season)}.
                            Gender: ${userGender}.
                            `,
                        },
                    ],
                });

                req.session.lastPrompt = response.choices[0].message.content.trim();
                
                const itemResponse = await openai.chat.completions.create({
                    model: "gpt-4",
                    messages: [
                        { role: "system", content: "You are a fashion designer. you find main item and translate to Korean." },
                        { role: "user", content: `Generate a main fashion item in prompt: ${req.session.lastPrompt}. you just return one word.` }
                    ],
                    temperature: 0,
                    max_tokens: 20,
                });

                const keyfashionitem = itemResponse.choices[0].message.content.trim().replace(/\s+/g, '');;
                keywordURL = `https://www.musinsa.com/search/goods?keyword=${keyfashionitem}&keywordType=keyword&gf=A`;
            }
        }
        console.log('최종 프롬프트:', req.session.lastPrompt); // 프롬프트 확인
        
        console.log(`${keywordURL}`); //URL확인

        // 2: 이미지 생성 API에 요청
        const imageResponse = await openai.images.generate({
            prompt: req.session.lastPrompt, // 프롬프트를 JSON 형식으로 전달
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