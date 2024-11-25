// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt'); // 비밀번호 암호화를 위한 bcrypt

// 회원가입 라우트
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.run(query, [username, hashedPassword], function (err) {
    if (err) {
      console.error('회원가입 오류:', err.message);
      res.status(500).json({ error: '회원가입 실패' });
    } else {
      res.status(200).json({ message: '회원가입 성공', userId: this.lastID });
    }
  });
});

// 로그인 라우트
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ?';
  db.get(query, [username], async (err, user) => {
    if (err) {
      console.error('로그인 오류:', err.message);
      res.status(500).json({ error: '로그인 실패' });
    } else if (!user) {
      res.status(401).json({ error: '사용자를 찾을 수 없습니다.' });
    } else {
      // 비밀번호 확인
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        // 세션에 사용자 정보 저장
        req.session.userId = user.id;
        res.status(200).json({ message: '로그인 성공', userId: user.id });
      } else {
        res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
      }
    }
  });
});

// 로그아웃 라우트
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.status(200).json({ message: '로그아웃 성공' });
});

module.exports = router;
