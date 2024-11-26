// dotenv 불러오기
const dotenv = require('dotenv');
const path = require('path');
// express 불러오기
const express = require("express");
// openAI 불러오기
const OpenAI = require('openai'); // OpenAI를 기본으로 가져옴
const { getWeatherData } = require('../weather/weather'); // weather.js에서 날씨 데이터 함수 가져오기

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

// 날씨 상태를 한국어로 변환하는 함수 (수정된 부분)
function translateWeather(pty, sky) {
    if (pty === 'Rain') return '비가 옵니다.';
    if (pty === 'Snow') return '눈이 옵니다.';
    switch (sky) {
        case 'Clear': return '맑습니다.';
        case 'Partly Cloudy': return '구름이 조금 있습니다.';
        case 'Mostly Cloudy': return '구름이 많습니다.';
        case 'Overcast': return '흐립니다.';
        default: return '알 수 없는 날씨입니다.';
    }
}

// OpenAI API를 호출하는 라우트, /generate-APIprompt 엔드포인트
router.post('/generate-APIprompt', async (req, res) => {
    console.log('프롬프트 전달받은 변수:', req.body); // 요청 로그 출력

    try {
        // 사용자에게 받은 텍스트
        const { userInput, location, keyword } = req.body;

        // 날씨 데이터 가져오기
        const weatherData = await getWeatherData(location); // 기본 위치는 서울
        const { minTemp, maxTemp, avgTemp, pty, sky,pop} = weatherData;

        // 날씨 상태를 한국어로 변환
        const translatedWeather = translateWeather(pty, sky);

        let newInput;
        if(keyword && keyword != ""){
            newInput = `Please create a promotional message using "${userInput}" and ${keyword}. Ensure that the response is structured with clear paragraph breaks for better readability. Please write the results in Korean. Ensure that your response does not exceed 200 characters.`;
        }else{
            newInput = `Please create a promotional message using "${userInput}". Ensure that the response is structured with clear paragraph breaks for better readability. Please write the results in Korean. Ensure that your response does not exceed 200 characters.`;
        }
        // 1: LLM API에 프롬프트 요청
        const response = await openai.chat.completions.create({
            model: 'gpt-4', // 모델을 gpt-4모델로 설정
            messages: [
                {
                    role: 'system',
                    content: "You are an employee who creates advertising text for a clothing shopping mall. Use appropriate emojis to enhance the appeal and readability of your text. Ensure the tone is engaging and visually inviting."
                },
                {
                    role: 'user',
                    content: newInput
                }
            ],
        });

        // 프롬프트 정리
        const prompt = response.choices[0].message.content.trim(); // response에서 결과 가져오기

        console.log('최종 문구:', prompt); // 프롬프트 출력

        // 사용자에게 프롬프트 전달
        res.json({
            prompt: `오늘의 최저기온은 ${minTemp}도, 최고기온은 ${maxTemp}도, 평균기온은 ${avgTemp}도 이고 강수확률은 ${pop}%입니다. 그리고 오늘의 날씨는 ${translatedWeather}\n\n${prompt}`
        });

    } catch (error) {
        console.error('Error with OpenAI API request:', error.message);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

module.exports = router;