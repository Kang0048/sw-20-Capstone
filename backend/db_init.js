// backend/db_init.js

const db = require('./db');

db.serialize(() => {
    // users 테이블 생성 (이미 존재한다고 가정)
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password TEXT
        )
    `, (err) => {
        if (err) {
            console.error('users 테이블 생성 오류:', err.message);
        } else {
            console.log('users 테이블 생성 완료');
        }
    });

    // messages 테이블 생성 (이미 존재한다고 가정)
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            content TEXT,
            image_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('messages 테이블 생성 오류:', err.message);
        } else {
            console.log('messages 테이블 생성 완료');
        }
    });

    // address_books 테이블 생성
    db.run(`
        CREATE TABLE IF NOT EXISTS address_books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            region TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('address_books 테이블 생성 오류:', err.message);
        } else {
            console.log('address_books 테이블 생성 완료');
        }
    });

    // contacts 테이블 생성
    db.run(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            address_book_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(address_book_id) REFERENCES address_books(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('contacts 테이블 생성 오류:', err.message);
        } else {
            console.log('contacts 테이블 생성 완료');
        }
    });

    // message_recipients 테이블 생성
    db.run(`
        CREATE TABLE IF NOT EXISTS message_recipients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id INTEGER NOT NULL,
            recipient TEXT NOT NULL,
            FOREIGN KEY(message_id) REFERENCES messages(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('message_recipients 테이블 생성 오류:', err.message);
        } else {
            console.log('message_recipients 테이블 생성 완료');
        }
    });
});

console.log('데이터베이스 초기화 완료');

// 데이터베이스 연결 종료
db.close();
