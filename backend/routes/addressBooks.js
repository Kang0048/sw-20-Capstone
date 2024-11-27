// backend/routes/addressBooks.js

const express = require('express');
const router = express.Router();
const db = require('../db');

// **인증 미들웨어**
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: '인증되지 않은 사용자입니다.' });
    }
}

// **주소록 생성 라우트**
router.post('/create', isAuthenticated, (req, res) => {
    const { name, region } = req.body;
    const userId = req.session.userId;

    if (!name) {
        return res.status(400).json({ error: '주소록 이름은 필수입니다.' });
    }

    const query = 'INSERT INTO address_books (user_id, name, region) VALUES (?, ?, ?)';
    db.run(query, [userId, name, region || ''], function(err) {
        if (err) {
            console.error('주소록 생성 오류:', err.message);
            return res.status(500).json({ error: '주소록 생성에 실패했습니다.' });
        }
        res.status(200).json({ message: '주소록이 성공적으로 생성되었습니다.', addressBookId: this.lastID });
    });
});

// **주소록 목록 조회 라우트**
router.get('/', isAuthenticated, (req, res) => {
    const userId = req.session.userId;

    const query = 'SELECT id, name, region, created_at FROM address_books WHERE user_id = ?';
    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error('주소록 조회 오류:', err.message);
            return res.status(500).json({ error: '주소록 조회에 실패했습니다.' });
        }
        res.status(200).json({ addressBooks: rows });
    });
});

// **주소록 삭제 라우트 (선택 사항)**
router.delete('/:id', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const addressBookId = req.params.id;

    // 주소록 소유자 확인
    const checkQuery = 'SELECT * FROM address_books WHERE id = ? AND user_id = ?';
    db.get(checkQuery, [addressBookId, userId], (err, row) => {
        if (err) {
            console.error('주소록 삭제 확인 오류:', err.message);
            return res.status(500).json({ error: '주소록 삭제 확인에 실패했습니다.' });
        }
        if (!row) {
            return res.status(404).json({ error: '삭제할 주소록을 찾을 수 없습니다.' });
        }

        // 주소록 삭제
        const deleteQuery = 'DELETE FROM address_books WHERE id = ?';
        db.run(deleteQuery, [addressBookId], function(err) {
            if (err) {
                console.error('주소록 삭제 오류:', err.message);
                return res.status(500).json({ error: '주소록 삭제에 실패했습니다.' });
            }
            res.status(200).json({ message: '주소록이 성공적으로 삭제되었습니다.' });
        });
    });
});

module.exports = router;
