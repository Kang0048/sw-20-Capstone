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

// 추가된 라이브러리
const axios = require('axios');

// 라우트 파일 임포트
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/message');

// .env 파일의 API 키를 로드 (파일 경로 지정)
dotenv.config({ path: path.resolve(__dirname, 'touch.env') });

// express 사용
const app = express();
// 포트번호 설정
const port = 5000;
const session = require('express-session');

// 미들웨어 설정
app.use(cors());
app.use(express.json({ limit: '10mb' })); // JSON 요청 크기 제한을 10MB로 설정
app.use(express.urlencoded({ limit: '10mb', extended: true })); // URL-encoded 데이터 크기 제한
app.use(
  session({
    secret: 'your-secret-key', // 세션 암호화 키
    resave: false, // 세션을 항상 저장할지 여부
    saveUninitialized: true, // 초기화되지 않은 세션을 저장할지 여부
    cookie: {
      secure: false, // HTTPS를 사용하는 경우 true로 설정
      maxAge: 60000, // 쿠키 유효 기간 (밀리초, 1분)
    },
  })
);

// 라우트 사용
app.use('/auth', authRoutes);
app.use('/message', messageRoutes);

// CORS 문제 해결을 위한 프록시 라우트 추가
app.post('/api/proxy', async (req, res) => {
  const { url, method, headers, data } = req.body; // 요청 데이터를 파싱
  try {
    const response = await axios({
      url,
      method,
      headers,
      data,
      timeout: 5000,
      responseType: method === 'GET' ? 'stream' : 'json', // 이미지 URL을 GET 요청할 경우 스트림으로 처리
    });

    // 이미지 URL 처리 로직
    if (method === 'GET' && headers['Accept'] === 'image/*') {
      const chunks = [];
      response.data.on('data', (chunk) => chunks.push(chunk));
      response.data.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const base64Image = buffer.toString('base64');
        res.json({
          name: 'image.jpg',
          size: buffer.length,
          data: base64Image,
        });
      });
    } else {
      res.status(response.status).json(response.data);
    }
  } catch (error) {
    console.error('프록시 요청 실패:', error.response?.data || error.message);
    res
      .status(error.response?.status || 500)
      .send(error.response?.data || { error: error.message });
  }
});

// Weather API
app.get('/api/weather', async (req, res) => {
  const location = req.query.location || 'seoul'; // 기본 값: 서울
  try {
    const weatherData = await getWeatherData(location); // weather.js에서 불러온 함수
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API 요청 실패:', error.message);
    res.status(500).send({ error: 'Failed to fetch weather data' });
  }
});

// OpenAI API 설정
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  console.error('OPENAI_API_KEY is missing or empty.');
  process.exit(1); // 서버 종료
}
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

// 정적 파일 제공
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/backend', express.static(path.join(__dirname)));

// HTML 파일 경로 설정
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
