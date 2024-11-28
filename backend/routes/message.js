// backend/routes/message.js

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

// **메시지 내역 조회 라우트**
router.get('/history', isAuthenticated, (req, res) => {
    const userId = req.session.userId;

    const query = `
        SELECT 
            m.id, 
            m.content, 
            m.image_path, 
            m.created_at, 
            COUNT(r.id) as recipients_count
        FROM 
            messages m
        LEFT JOIN 
            message_recipients r ON m.id = r.message_id
        WHERE 
            m.user_id = ?
        GROUP BY 
            m.id
        ORDER BY 
            m.created_at DESC
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error('메시지 내역 조회 오류:', err.message);
            return res.status(500).json({ error: '메시지 내역 조회에 실패했습니다.' });
        }
        res.status(200).json({ messages: rows });
    });
});

// **메시지 상세 조회 라우트**
router.get('/:id', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const messageId = req.params.id;

    // 메시지 소유자 확인
    const checkQuery = 'SELECT * FROM messages WHERE id = ? AND user_id = ?';
    db.get(checkQuery, [messageId, userId], (err, row) => {
        if (err) {
            console.error('메시지 상세 조회 오류:', err.message);
            return res.status(500).json({ error: '메시지 상세 조회에 실패했습니다.' });
        }
        if (!row) {
            return res.status(404).json({ error: '메시지를 찾을 수 없습니다.' });
        }

        // 수신자 목록 조회
        const recipientsQuery = 'SELECT recipient FROM message_recipients WHERE message_id = ?';
        db.all(recipientsQuery, [messageId], (err, recipients) => {
            if (err) {
                console.error('수신자 조회 오류:', err.message);
                return res.status(500).json({ error: '수신자 조회에 실패했습니다.' });
            }
            res.status(200).json({ message: row, recipients });
        });
    });
});

// **메시지 전송 라우트 (예시)**
router.post('/send', isAuthenticated, (req, res) => {
    const { to, from, name, content, image } = req.body;
    const userId = req.session.userId;

    if (!from || !to || !content) {
        return res.status(400).json({ error: '발신번호, 수신번호, 메시지 내용은 필수입니다.' });
    }

    // 메시지 삽입
    const insertMessageQuery = 'INSERT INTO messages (user_id, content, image_path) VALUES (?, ?, ?)';
    db.run(insertMessageQuery, [userId, content, image || ''], function(err) {
        if (err) {
            console.error('메시지 전송 오류:', err.message);
            return res.status(500).json({ error: '메시지 전송에 실패했습니다.' });
        }
        const messageId = this.lastID;

        // 수신자 삽입
        const insertRecipientQuery = 'INSERT INTO message_recipients (message_id, recipient) VALUES (?, ?)';
        const stmt = db.prepare(insertRecipientQuery);
        to.forEach(recipient => {
            stmt.run([messageId, recipient]);
        });
        stmt.finalize(err => {
            if (err) {
                console.error('수신자 삽입 오류:', err.message);
                return res.status(500).json({ error: '수신자 삽입에 실패했습니다.' });
            }
            res.status(200).json({ message: '메시지가 성공적으로 전송되었습니다.', messageId });
        });
    });
});

// **메시지 삭제 라우트 (선택 사항)**
router.delete('/:id', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const messageId = req.params.id;

    // 메시지 소유자 확인
    const checkQuery = 'SELECT * FROM messages WHERE id = ? AND user_id = ?';
    db.get(checkQuery, [messageId, userId], (err, row) => {
        if (err) {
            console.error('메시지 삭제 확인 오류:', err.message);
            return res.status(500).json({ error: '메시지 삭제 확인에 실패했습니다.' });
        }
        if (!row) {
            return res.status(404).json({ error: '삭제할 메시지를 찾을 수 없습니다.' });
        }

        // 메시지 삭제
        const deleteQuery = 'DELETE FROM messages WHERE id = ?';
        db.run(deleteQuery, [messageId], function(err) {
            if (err) {
                console.error('메시지 삭제 오류:', err.message);
                return res.status(500).json({ error: '메시지 삭제에 실패했습니다.' });
            }
            res.status(200).json({ message: '메시지가 성공적으로 삭제되었습니다.' });
        });
    });
});

module.exports = router;
