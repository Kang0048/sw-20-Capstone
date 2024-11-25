// backend/routes/openai.js

const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const db = require('../db');

// OpenAI API 설정
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  console.error('OPENAI_API_KEY is missing or empty.');
  process.exit(1);
}
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

// 이미지 생성 라우트
router.post('/generate-image', async (req, res) => {
  const userId = req.session.userId;
  const { content } = req.body;

  if (!userId) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }

  try {
    // OpenAI API를 사용하여 이미지 생성
    const imageResponse = await openai.images.generate({
      prompt: content,
      n: 1,
      size: '256x256',
    });

    const imageUrl = imageResponse.data[0].url;

    // 이미지 다운로드 및 저장
    const imageResponseData = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponseData.data, 'binary');

    // 이미지 파일 저장
    const uniqueFilename = 'generated-' + Date.now() + '.png';
    const imagePath = path.join(__dirname, '../uploads', uniqueFilename);
    fs.writeFileSync(imagePath, imageBuffer);

    // 데이터베이스에 메시지와 이미지 경로 저장
    const query = 'INSERT INTO messages (user_id, content, image_path) VALUES (?, ?, ?)';
    db.run(query, [userId, content, uniqueFilename], function (err) {
      if (err) {
        console.error('메시지 저장 오류:', err.message);
        res.status(500).json({ error: '메시지 저장 실패' });
      } else {
        res.status(200).json({ message: '이미지 생성 및 저장 성공', imageUrl: '/uploads/' + uniqueFilename });
      }
    });
  } catch (error) {
    console.error('OpenAI API 오류:', error.message);
    res.status(500).json({ error: '이미지 생성 실패' });
  }
});

module.exports = router;
