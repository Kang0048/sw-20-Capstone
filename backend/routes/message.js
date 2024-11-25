// backend/routes/message.js

const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer'); // 파일 업로드를 위한 multer
const path = require('path');
const fs = require('fs');

// 이미지 저장을 위한 디렉토리 설정
const uploadDir = path.join(__dirname, '../uploads');

// 디렉토리 없으면 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 파일 이름을 고유하게 생성
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 메시지 저장 라우트
router.post('/send', upload.single('image'), (req, res) => {
  const userId = req.session.userId;
  const content = req.body.content;
  const imageFile = req.file ? req.file.filename : null;

  if (!userId) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }

  const query = 'INSERT INTO messages (user_id, content, image_path) VALUES (?, ?, ?)';
  db.run(query, [userId, content, imageFile], function (err) {
    if (err) {
      console.error('메시지 저장 오류:', err.message);
      res.status(500).json({ error: '메시지 저장 실패' });
    } else {
      res.status(200).json({ message: '메시지 저장 성공', messageId: this.lastID });
    }
  });
});

// 메시지 조회 라우트
router.get('/history', (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }

  const query = 'SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC';
  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error('메시지 조회 오류:', err.message);
      res.status(500).json({ error: '메시지 조회 실패' });
    } else {
      res.status(200).json({ messages: rows });
    }
  });
});

module.exports = router;
