// backend/db_init.js

const db = require('./db');

// 데이터베이스 초기화
db.serialize(() => {
  // users 테이블 생성
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `, (err) => {
    if (err) {
      console.error('users 테이블 생성 오류:', err.message);
    } else {
      console.log('users 테이블 생성 완료');
    }
  });

  // messages 테이블 생성
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      content TEXT,
      image_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('messages 테이블 생성 오류:', err.message);
    } else {
      console.log('messages 테이블 생성 완료');
    }
  });

  // 필요한 추가 테이블 생성 가능
  // ...

  console.log('데이터베이스 초기화 완료');
});

// 데이터베이스 연결 종료
db.close();
