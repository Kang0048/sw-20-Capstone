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
const openAI_Image = require("./openAI_Image"); 
const openAI_Prompt = require("./openAI_prompt");

// express 사용
const app = express();
// 포트번호 설정
const port = 5000;

app.use(cors());
app.use(express.json());

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

app.use('/', openAI_Image);
app.use('/', openAI_Prompt);

// http 실행
app.listen(port, () => {
    console.log(`서버가 정상적으로 실행되었습니다.`);
});