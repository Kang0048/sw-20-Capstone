// dotenv 불러오기
const dotenv = require('dotenv');
const path = require('path');
// Cors 불러오기
const cors = require('cors');
// express 불러오기
const express = require('express');
// openAI 불러오기
const OpenAI = require('openai'); // OpenAI를 기본으로 가져옴
const { getWeatherData } = require('../weather/weather.js');
// 이미지 생성 API 불러오기
const openAI_Image = require('./openAI_Image');
const openAI_Prompt = require('./openAI_prompt');
const openAi_UserImage = require('./openAi_userImage');

// 라우트 파일 임포트
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/message');

// .env 파일의 API 키를 로드 (파일 경로 지정)
dotenv.config({ path: path.resolve(__dirname, 'touch.env') });

// express 사용
const app = express();
// 포트번호 설정
const port = 5000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 라우트 사용
app.use('/auth', authRoutes);
app.use('/message', messageRoutes);

app.get('/api/weather', async (req, res) => {
  const location = req.query.location || 'seoul'; // 기본 값: 서울
  try {
    const weatherData = await getWeatherData(location); // weather.js에서 불러온 함수
    res.json(weatherData);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch weather data' });
  }
});

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

// 정적 파일 제공
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/backend', express.static(path.join(__dirname)));

// 원하는 HTML 파일 경로
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'weather.html'));
});

// OpenAI 관련 라우트 사용
app.use('/', openAI_Image);
app.use('/', openAI_Prompt);
app.use('/', openAi_UserImage);

// 서버 실행
app.listen(port, () => {
  console.log(`서버가 ${port}번 포트에서 실행 중입니다.`);
});
