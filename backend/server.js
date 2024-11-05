// dotenv 불러오기
const dotenv = require('dotenv');
const path = require('path');
// .env 파일의 API 키를 로드 (파일 경로 지정)
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Cors 불러오기
const cors = require('cors');
// express 불러오기
const express = require("express");
// openAI 불러오기
const OpenAI = require('openai'); // OpenAI를 기본으로 가져옴
// 이미지 생성 API 불러오기
// const openAI_Image = require("./openAI_Image"); 


// express 사용
const app = express();
// 포트번호 설정
const port = 5000;

app.use(cors());
app.use(express.json());

//app.use('/', openAI_Image);

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

app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/backend', express.static(path.join(__dirname)));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend","weather.html")); // 원하는 HTML 파일 경로
});



// express 사용
// const router = express.Router();

// OpenAI API를 호출하는 라우트, /generate-image 엔드포인트
app.post('/generate-APIimage', async (req, res) => {
    console.log('Request received:', req.body); // 요청 로그 출력
    /*
        * 프롬프트는 날씨(최저기온, 최고기온, 평균기온, 날씨)에 맞는 코디 이미지 생성 프롬프트
        * 날씨 api를 통해 받아와서 변수에 저장
        */
       
    const minTemp = 5;
    const avgTemp = 10.4;
    const sky = "cloudy";
    const maxTemp = 16;

    try {
        // 사용자에게 받은 텍스트
        const { userKeyword } = req.body;
        // 사용자의 입력값에 더해진 새로운 입력값
        let newInput;
        if(userKeyword != null&& userKeyword.trim() !== ""){
            newInput = `Please provide your response in English. With an outfit suitable for weather conditions with a minimum 
            temperature of ${minTemp}°C, an average temperature of ${avgTemp}°C, and a maximum temperature of ${maxTemp}°C. 
            The weather is described as "${sky}". Just focus on the outfit. Change ${userKeyword} to English and create 
            an outfit style that includes ${userKeyword}. Recommend an outfit with use that is appropriate 
            for these temperatures and weather conditions. Additionally, create a background that matches the weather condition 
            described as "${sky}". Make sure that the length of your response does not exceed 700 characters.`;
        }else{
            newInput = `Please provide your response in English. With an outfit suitable for weather conditions with a minimum 
            temperature of ${minTemp}°C, an average temperature of ${avgTemp}°C, and a maximum temperature of ${maxTemp}°C. 
            The weather is described as "${sky}".Recommend an outfit with use that is appropriate for these temperatures 
            and weather conditions. Additionally, create a background that matches the weather condition described as "${sky}".
            Make sure that the length of your response does not exceed 700 characters.`;
        }
        console.log('Input :', newInput); // 프롬프트 로그 출력

        
        // 1: LLM API에 프롬프트 요청
        const response = await openai.chat.completions.create({
            model: 'gpt-4', // 모델을 gpt-4모델로 설정
            messages: [{ role: 'user', content: newInput }], // newInput을 프롬프트로 사용
        });

        // 프롬프트 정리
        const prompt = response.choices[0].message.content.trim(); // response에서 결과 가져오기

        // 수정사항이 추가된 프롬프트
        let lastPrompt = `${prompt}Create an image of a person from shoulder to end of foot. Focus only on the clothing and shoe,
        and if the face is visible, paint it black. Never put words, numbers, or text in the image.`

        console.log('Generated Prompt:', lastPrompt); // 프롬프트 출력
          
        /*
        * api 요청을 한번 더 해서 last prompt에서 키워드를 하나 추출해서 가져오도록
        * url에 삽입할 키워드 가져와서 저장하기
        */
         // 1-1: LLM API에 키워드 추출 요청
        const responseKeyword = await openai.chat.completions.create({
            model: 'gpt-4', // 모델을 gpt-4모델로 설정
            messages: [{ role: 'user', content: lastPrompt + "From this prompt, please extract one key fashion item and enter it in Korean." }], // lastPrompt에서 키워드 단어를 추출
        });

        const AIKeyword = responseKeyword.choices[0].message.content.trim();
        const keywordURL = `https://www.musinsa.com/search/goods?keyword=${AIKeyword}&keywordType=keyword&gf=A`;
        console.log(`https://www.musinsa.com/search/goods?keyword=${AIKeyword}&keywordType=keyword&gf=A`);

        // 2: 이미지 생성 API에 요청
        const imageResponse = await openai.images.generate({
            prompt: lastPrompt, // 프롬프트를 JSON 형식으로 전달
            n: 4, // 생성할 이미지 수
            quality:"standard",
            size: "256x256" // 이미지 크기
        });


        // 3: 응답 처리
        const images = imageResponse.data.map(image => image.url);

        // 사용자에게는 이미지 URL과 크기 정보를 전달
        res.json({ images: images,  keywordURL: keywordURL});
    } catch (error) {
        console.error('Error with OpenAI API request:', error.message);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});


// http 실행
app.listen(port, () => {
    console.log(`서버가 정상적으로 실행되었습니다.`);
});