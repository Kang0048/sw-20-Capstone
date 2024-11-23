const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// 인증 미들웨어
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: '인증 토큰이 없습니다.' });

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
    req.user = user;
    next();
  });
}

// 발송 기록 조회 라우트
router.get('/messages', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM messages WHERE user_id = ?', [req.user.id]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 메시지 발송 라우트 (예시)
router.post('/send', authenticateToken, async (req, res) => {
  const { messageContent } = req.body;
  try {
    // 뿌리오 API를 통해 문자 발송 로직 구현 (생략)
    // ...

    // 발송 기록 저장
    await db.execute(
      'INSERT INTO messages (user_id, message_content) VALUES (?, ?)',
      [req.user.id, messageContent]
    );

    res.json({ message: '메시지가 발송되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 메시지 내역 조회 라우트
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [messages] = await db.execute('SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json({ messages });
  } catch (error) {
    console.error('Message Fetch Error:', error);
    res.status(500).json({ error: '메시지 내역 조회 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
