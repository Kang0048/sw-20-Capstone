// dotenv 불러오기
const dotenv = require('dotenv');
const fs = require('fs');
const axios = require('axios');
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
// const { selectItem } = require('./selectitem');
// 시즌
// const { seasonBack } = require('./seasonalprompt');
// .env 파일의 API 키를 로드 (파일 경로 지정)
dotenv.config({ path: path.resolve(__dirname, 'touch.env') });
const app = express();
const session = require('express-session');

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

const fixPrompt = async (originalPrompt, userFix) => {
  console.log('수정사항 실행중');
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `
          You are a pro prompt editor and professional fashion assistant. Your primary task is to modify the given prompt by incorporating the user's additional requests as accurately as possible while maintaining the original context and style.
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
    if (!req.session.lastPrompt) {
        req.session.lastPrompt = ''; // 기본값 설정
        console.log('Initializing lastPrompt in session');
    }
    try {
        // 사용자에게 받은 텍스트
        const { userKeyword, userLoc, userGender, userInputFix} = req.body;

        // 날씨 데이터 가져오기
        const weatherData = await getWeatherData(userLoc); // 기본 위치는 서울
        const season = weatherData.season;
        const pty = weatherData.pty;

        if (userInputFix && req.session.lastPrompt != '') {
            const previousPrompt = req.session.lastPrompt;
            if (!previousPrompt) {
              return res
                .status(400)
                .json({ error: 'No previous prompt found in session.' });
            }
            prompt = await fixPrompt(previousPrompt, userInputFix);
            req.session.lastPrompt = prompt;
        }
        else{
            req.session.lastPrompt = '';
            const response = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                  {
                    role: 'system',
                    content: `
                      You are a professional fashion assistant specializing in creating hyper-realistic and stylized digital art prompts for a fashion image generation AI.
                      Your task is to describe the outfit and its components in rich detail, including materials, colors, and their suitability for the given season, weather, and gender.
                      Add descriptive elements to enhance the visual appeal, such as the style, texture, and purpose of the clothing items.
                      Integrate high-quality visual cues and camera-related keywords, such as:
                      "photo-realistic", "cinematic lighting", "shallow depth of field", "ultra-detailed", and "hyper-realistic".
                      Ensure the background reflects the given season and weather , incorporating elements that create a cohesive and immersive scene.
                      The prompt must remain concise and under 1000 characters, ensuring there is no text in the generated image.
                      Example Prompt: "A stylish outfit for a snowy winter day. The male model wears a deep navy woolen coat, tailored for a sleek silhouette. Underneath is an ivory turtleneck sweater paired with charcoal grey trousers. Accessories include a knitted teal scarf and matching beanie. The scene features softly falling snow in a tranquil winter forest, rendered in photo-realistic detail with cinematic lighting and shallow depth of field."
                    `,
                  },
                  {
                    role: 'user',
                    content: `
                      Generate a detailed fashion image prompt using the following parameters:
                      - Season: ${season}.
                      - Weather: ${pty}.
                      - Key Item: ${userKeyword}.
                      - Gender: ${userGender}.
                      The background must reflects the ${season} season and ${pty}, and the image should be rendered with hyper-realistic details, cinematic lighting, and a focus on DSLR-quality output.
                    `,
                  },
                ],
              });
           
            var prompt = response.choices[0].message.content.trim(); // response에서 결과 가져오기
            req.session.lastPrompt = prompt;
        }

          console.log('최종 프롬프트:', prompt); // 프롬프트 확인
          const itemResponse = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
              { role: "system", content: "You are a fashion designer. you find main item and translate from Korean to English." },
              { role: "user", content: `Generate a main fashion item in prompt: ${req.session.lastPrompt}. you just return one korean word.` }
              ],
              temperature: 0,
              max_tokens: 15,
          });

          const keyfashionitem = itemResponse.choices[0].message.content.trim().replace(/\s+/g, '');
          
          const keywordURL = `https://www.musinsa.com/search/goods?keyword=${keyfashionitem}&keywordType=keyword&gf=A`;
                    
          console.log(`${keywordURL}`); //URL확인

        // DALL-E 3 이미지 생성 요청
        const numberOfImages = 4; // 병렬로 생성할 이미지 수
        const imagePromises = Array.from({ length: numberOfImages }).map(() =>
            openai.images.generate({
                prompt: prompt,
                model: 'dall-e-3',
                quality: 'hd',
                n: 1,
                size: '1024x1024',
            })
        );
        // 3: 응답 처리
        // 이미지 URL 배열화
        const imageResponses = await Promise.all(imagePromises);
        console.log("사진 생성 완료");
        const images = imageResponses.flatMap((response) =>
            response.data.map((image) => image.url)
        );

    res.json({ images: images, keywordURL: keywordURL });
} catch (error) {
    console.error('Error response from OpenAI:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate images.', details: error.response?.data || error.message });
}
});

module.exports = router;