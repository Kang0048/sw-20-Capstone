// server.js
const express = require('express');
const path = require('path');
const app = express();
const port = 3001;

// HTML 파일이 있는 폴더를 static으로 설정
app.use(express.static(path.join(__dirname)));

// 1번 페이지를 기본 경로로 설정
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'ai-image.html'));
});

// 서버 실행
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});