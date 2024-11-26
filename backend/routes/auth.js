// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt'); // 비밀번호 암호화를 위한 bcrypt

// 회원가입 라우트 수정
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // 입력값 검증
  if (!username || !email || !password) {
      return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
  }

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  db.run(query, [username, email, hashedPassword], function (err) {
      if (err) {
          console.error('회원가입 오류:', err.message);
          if (err.message.includes('UNIQUE constraint failed')) {
              return res.status(400).json({ error: '이미 존재하는 사용자명 또는 이메일입니다.' });
          }
          return res.status(500).json({ error: '회원가입 실패' });
      } else {
          // 회원가입 성공 후 세션에 사용자 정보 저장 (자동 로그인)
          req.session.userId = this.lastID;
          res.status(200).json({ message: '회원가입 및 로그인 성공', userId: this.lastID });
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

// 로그인 상태 확인 라우트
router.get('/status', (req, res) => {
  if (req.session.userId) {
      res.status(200).json({ loggedIn: true, userId: req.session.userId });
  } else {
      res.status(200).json({ loggedIn: false });
  }
});

// 로그아웃 라우트
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          console.error('세션 파기 오류:', err);
          return res.status(500).json({ error: '로그아웃 실패' });
      }
      res.clearCookie('connect.sid'); // 쿠키 제거
      res.status(200).json({ message: '로그아웃 성공' });
  });
});


module.exports = router;
