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
    const userId = req.session.userId;
    const { name, region } = req.body;

    if (!name) {
        return res.status(400).json({ error: '주소록 이름은 필수입니다.' });
    }

    const insertQuery = 'INSERT INTO address_books (user_id, name, region) VALUES (?, ?, ?)';
    db.run(insertQuery, [userId, name, region || ''], function(err) {
        if (err) {
            console.error('주소록 생성 오류:', err.message);
            return res.status(500).json({ error: '주소록 생성에 실패했습니다.' });
        }
        res.status(200).json({ message: '주소록이 성공적으로 생성되었습니다.', addressBookId: this.lastID });
    });
});

// **사용자 주소록 목록 조회 라우트**
router.get('/list', isAuthenticated, (req, res) => {
    const userId = req.session.userId;

    const query = 'SELECT * FROM address_books WHERE user_id = ? ORDER BY created_at DESC';
    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error('주소록 목록 조회 오류:', err.message);
            return res.status(500).json({ error: '주소록 목록 조회에 실패했습니다.' });
        }
        res.status(200).json({ addressBooks: rows });
    });
});

// **특정 주소록의 연락처 목록 조회 라우트**
router.get('/:id/contacts', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const addressBookId = req.params.id;

    // 주소록 소유자 및 정보 확인
    const checkQuery = 'SELECT * FROM address_books WHERE id = ? AND user_id = ?';
    db.get(checkQuery, [addressBookId, userId], (err, addressBook) => {
        if (err) {
            console.error('주소록 소유자 확인 오류:', err.message);
            return res.status(500).json({ error: '주소록 소유자 확인에 실패했습니다.' });
        }
        if (!addressBook) {
            return res.status(404).json({ error: '주소록을 찾을 수 없습니다.' });
        }

        // 연락처 목록 조회
        const contactsQuery = 'SELECT * FROM contacts WHERE address_book_id = ? ORDER BY created_at DESC';
        db.all(contactsQuery, [addressBookId], (err, contacts) => {
            if (err) {
                console.error('연락처 목록 조회 오류:', err.message);
                return res.status(500).json({ error: '연락처 목록 조회에 실패했습니다.' });
            }
            res.status(200).json({ addressBook, contacts });
        });
    });
});

// **연락처 추가 라우트**
router.post('/:id/contacts/add', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const addressBookId = req.params.id;
    const { name, phone, note } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ error: '연락처 이름과 전화번호는 필수입니다.' });
    }

    // 주소록 소유자 확인
    const checkQuery = 'SELECT * FROM address_books WHERE id = ? AND user_id = ?';
    db.get(checkQuery, [addressBookId, userId], (err, addressBook) => {
        if (err) {
            console.error('주소록 소유자 확인 오류:', err.message);
            return res.status(500).json({ error: '주소록 소유자 확인에 실패했습니다.' });
        }
        if (!addressBook) {
            return res.status(404).json({ error: '주소록을 찾을 수 없습니다.' });
        }

        // 연락처 삽입
        const insertQuery = 'INSERT INTO contacts (address_book_id, name, phone, note) VALUES (?, ?, ?, ?)';
        db.run(insertQuery, [addressBookId, name, phone, note || ''], function(err) {
            if (err) {
                console.error('연락처 추가 오류:', err.message);
                return res.status(500).json({ error: '연락처 추가에 실패했습니다.' });
            }
            res.status(200).json({ message: '연락처가 성공적으로 추가되었습니다.', contactId: this.lastID });
        });
    });
});

// **연락처 삭제 라우트**
router.delete('/:id/contacts/:contactId/delete', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const addressBookId = req.params.id;
    const contactId = req.params.contactId;

    // 주소록 소유자 확인
    const checkAddressBookQuery = 'SELECT * FROM address_books WHERE id = ? AND user_id = ?';
    db.get(checkAddressBookQuery, [addressBookId, userId], (err, addressBook) => {
        if (err) {
            console.error('주소록 소유자 확인 오류:', err.message);
            return res.status(500).json({ error: '주소록 소유자 확인에 실패했습니다.' });
        }
        if (!addressBook) {
            return res.status(404).json({ error: '주소록을 찾을 수 없습니다.' });
        }

        // 연락처 삭제
        const deleteQuery = 'DELETE FROM contacts WHERE id = ? AND address_book_id = ?';
        db.run(deleteQuery, [contactId, addressBookId], function(err) {
            if (err) {
                console.error('연락처 삭제 오류:', err.message);
                return res.status(500).json({ error: '연락처 삭제에 실패했습니다.' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: '삭제할 연락처를 찾을 수 없습니다.' });
            }
            res.status(200).json({ message: '연락처가 성공적으로 삭제되었습니다.' });
        });
    });
});

// **주소록 삭제 라우트**
router.delete('/:id/delete', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const addressBookId = req.params.id;

    // 주소록 소유자 확인
    const checkQuery = 'SELECT * FROM address_books WHERE id = ? AND user_id = ?';
    db.get(checkQuery, [addressBookId, userId], (err, addressBook) => {
        if (err) {
            console.error('주소록 소유자 확인 오류:', err.message);
            return res.status(500).json({ error: '주소록 소유자 확인에 실패했습니다.' });
        }
        if (!addressBook) {
            return res.status(404).json({ error: '주소록을 찾을 수 없습니다.' });
        }

        // 주소록 삭제 (연락처들도 ON DELETE CASCADE로 자동 삭제)
        const deleteQuery = 'DELETE FROM address_books WHERE id = ? AND user_id = ?';
        db.run(deleteQuery, [addressBookId, userId], function(err) {
            if (err) {
                console.error('주소록 삭제 오류:', err.message);
                return res.status(500).json({ error: '주소록 삭제에 실패했습니다.' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: '삭제할 주소록을 찾을 수 없습니다.' });
            }
            res.status(200).json({ message: '주소록이 성공적으로 삭제되었습니다.' });
        });
    });
});

module.exports = router;
