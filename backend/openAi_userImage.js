// dotenv 불러오기
const dotenv = require('dotenv');
const path = require('path');
// Cors 불러오기
const cors = require('cors');
// express 불러오기
const express = require('express');
// openAI 불러오기
const OpenAI = require('openai'); // OpenAI를 기본으로 가져옴
const app = express();
const session = require('express-session');
// .env 파일의 API 키를 로드 (파일 경로 지정)
dotenv.config({ path: path.resolve(__dirname, 'touch.env') });
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
router.post('/generate-userImage', async (req, res) => {
  console.log('Request received:', req.body); // 요청 로그 출력
  if (!req.session.lastPrompt) {
    req.session.lastPrompt = ''; // 기본값 설정
    console.log('Initializing lastPrompt in session');
  }
  try {
    // 사용자에게 받은 텍스트
    const {
      userInput,
      userSeason,
      userWeather,
      userItem,
      userSex,
      userInputFix,
    } = req.body;
    console.log('사용자 입력 프롬프트: ', userInput);
    if (userInputFix && req.session.prompt != '') {
      const previousPrompt = req.session.lastPrompt;
      if (!previousPrompt) {
        return res
          .status(400)
          .json({ error: 'No previous prompt found in session.' });
      }
      prompt = await fixPrompt(previousPrompt, userInputFix);
      req.session.prompt = prompt;
    }
    // 1: LLM API에 프롬프트 요청
    else {
      req.session.prompt = '';
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
              "photo-realistic", "cinematic lighting", "DSLR quality", "8K resolution", "shallow depth of field", "ultra-detailed", and "hyper-realistic".
              Ensure the background reflects the given season and weather , incorporating elements that create a cohesive and immersive scene.
              The prompt must remain concise and under 1000 characters, ensuring there is no text in the generated image.
              Example Prompt: "A stylish outfit for a snowy winter day. The male model wears a deep navy woolen coat, tailored for a sleek silhouette. Underneath is an ivory turtleneck sweater paired with charcoal grey trousers. Accessories include a knitted teal scarf and matching beanie. The scene features softly falling snow in a tranquil winter forest, rendered in photo-realistic detail with cinematic lighting and shallow depth of field."
            `,
          },
          {
            role: 'user',
            content: `
              Generate a detailed fashion image prompt using the following parameters:
              - Season: ${userSeason}.
              - Weather: ${userWeather}.
              - Key Item: ${userItem}.
              - Gender: ${userSex}.
              Additional User Input: "${userInput}".
              The background must reflects the ${userSeason} season and ${userWeather}, and the image should be rendered with hyper-realistic details, cinematic lighting, and a focus on DSLR-quality output.
            `,
          },
        ],
      });

      console.log('성공');
      // 프롬프트 정리
      var prompt = response.choices[0].message.content.trim(); // response에서 결과 가져오기
      req.session.lastPrompt = prompt;
      // console.log('Generated prompt:', prompt);
      //req.session.lastPrompt = prompt;
    }
    prompt += `background reflects the ${userWeather}`;
    // prompt =
    //'a man with a tie and a coat on posing for a picture in a park with trees in the background, Edward Clark, neoclassicism, promotional image, a character portrait';
    // "A stylish outfit designed for a snowy winter day. The male model is wearing a luxurious black leather jacket lined with soft faux fur for extra warmth. The outfit is paired with dark, slim-fit trousers, and sleek leather boots that complement the jacket's texture. Accessories include a cozy wool scarf in shades of gray and a matching pair of knitted gloves to enhance the winter feel. The background features a serene snowy landscape with gently falling snowflakes and frosted trees, creating a cozy yet sophisticated winter atmosphere. No text should be included in the image.";
    console.log(prompt);
    // 1-1: LLM API에 키워드 추출 요청
    const keywordURL = `https://www.musinsa.com/search/goods?keyword=${userItem}&keywordType=keyword&gf=A`;
    console.log(
      `https://www.musinsa.com/search/goods?keyword=${userItem}&keywordType=keyword&gf=A`
    );

    // 2: 이미지 생성 API에 요청

    const imageResponse = await openai.images.generate({
      // prompt: `A hyper-realistic image of a male model wearing a tailored double-breasted gray wool coat with a high stand-up collar and sharp lapels. Underneath, he wears a thick white cable-knit sweater, paired with dark slim-fit jeans. Black leather gloves complete his refined winter look. The background features a tranquil snowy forest with snow-covered pine trees and softly falling snowflakes. The scene is illuminated with cinematic lighting, emphasizing the textures of the coat and sweater. The image is captured with DSLR quality, featuring shallow depth of field and rendered in 8K resolution for ultra-detailed realism.`,
      prompt: prompt,
      n: 4,
      quality: 'hd',
      size: '1024x1024', // Adjust size if needed
    });

    // console.log(
    // 'Generated Images:',
    //imageResponse.data.map((img) => img.url)
    // );

    // 3: 응답 처리
    // 이미지 URL 배열화
    const images = imageResponse.data.map((image) => image.url);

    // 사용자에게는 이미지 URL과 크기 정보를 전달
    res.json({ images: images, keywordURL: keywordURL });
  } catch (error) {
    console.error('Error with OpenAI API request:', error.message);
    res
      .status(500)
      .json({ error: 'An error occurred while processing your request.' });
  }
});

module.exports = router;
