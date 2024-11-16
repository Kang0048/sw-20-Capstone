// dotenv 불러오기
const dotenv = require('dotenv');
const path = require('path');
// Cors 불러오기
const cors = require('cors');
// express 불러오기
const express = require('express');
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
router.post('/generate-userImage', async (req, res) => {
  console.log('Request received:', req.body); // 요청 로그 출력
  try {
    // 사용자에게 받은 텍스트
    const { userInput, userSeason, userWeather, userItem, userSex } = req.body;
    console.log('사용자 입력 프롬프트: ', userInput);
    // 1: LLM API에 프롬프트 요청
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `
            You are a fashion assistant that generates highly detailed image prompts for a fashion image generator AI. 
            The prompt should describe a stylish outfit based on season, weather, sex, and specified item. 
            Ensure the image depicts a full-body view from the lower part of the face down to the shoes. 
            Include all relevant details about clothing, colors, materials, and accessories to make the outfit look fashionable. 
            The background should reflect the season and weather. 
            Ensure there is no text in the image. The prompt must not exceed 1000 characters.
          `,
        },
        {
          role: 'user',
          content: `
            Generate a detailed image prompt using the following details: 
            User input: "${userInput}". 
            Season: ${userSeason}. 
            Weather: ${userWeather}. 
            Item: ${userItem}. 
            Gender: ${userSex}.
          `,
        },
      ],
    });

    // 프롬프트 정리
    const prompt = response.choices[0].message.content.trim(); // response에서 결과 가져오기
    console.log('Generated prompt:', prompt);

    // 수정사항이 추가된 프롬프트
    // let lastPrompt = `${prompt}Create an image of a person from shoulder to end of foot. Focus only on the clothing and shoe,
    //and if the face is visible, paint it black. Never put words, numbers, or text in the image.`

    //console.log('Generated Prompt:', lastPrompt); // 프롬프트 출력

    /*
     * api 요청을 한번 더 해서 last prompt에서 키워드를 하나 추출해서 가져오도록
     * url에 삽입할 키워드 가져와서 저장하기
     */
    // 1-1: LLM API에 키워드 추출 요청
    const keywordURL = `https://www.musinsa.com/search/goods?keyword=${userItem}&keywordType=keyword&gf=A`;
    console.log(
      `https://www.musinsa.com/search/goods?keyword=${userItem}&keywordType=keyword&gf=A`
    );

    // 2: 이미지 생성 API에 요청
    const imageResponse = await openai.images.generate({
      prompt: prompt, // 프롬프트를 JSON 형식으로 전달
      n: 4, // 생성할 이미지 수
      quality: 'hd',
      size: '256x256', // 이미지 크기
    });

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
