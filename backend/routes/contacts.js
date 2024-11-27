// backend/routes/contacts.js

const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// **인증 미들웨어**
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: '인증되지 않은 사용자입니다.' });
    }
}

// **파일 업로드 설정 (Multer)**
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 }, // 파일 크기 제한: 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'text/plain',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            // 'application/x-hwp' // HWP 파일 MIME 타입 (지원 여부에 따라 활성화)
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('지원하지 않는 파일 형식입니다.'));
        }
    }
});

// **연락처 업로드 라우트**
router.post('/upload/:addressBookId', isAuthenticated, upload.single('contactsFile'), (req, res) => {
    const userId = req.session.userId;
    const addressBookId = req.params.addressBookId;

    // 주소록 소유자 확인
    const checkQuery = 'SELECT * FROM address_books WHERE id = ? AND user_id = ?';
    db.get(checkQuery, [addressBookId, userId], (err, row) => {
        if (err) {
            console.error('주소록 확인 오류:', err.message);
            return res.status(500).json({ error: '주소록 확인에 실패했습니다.' });
        }
        if (!row) {
            return res.status(404).json({ error: '주소록을 찾을 수 없습니다.' });
        }

        // 파일이 업로드 되었는지 확인
        if (!req.file) {
            return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
        }

        const filePath = path.join(__dirname, '..', req.file.path);
        const fileExt = path.extname(req.file.originalname).toLowerCase();

        let contacts = [];

        try {
            if (fileExt === '.txt') {
                // TXT 파일 파싱 (각 줄: 이름,전화번호,메모)
                const data = fs.readFileSync(filePath, 'utf8');
                const lines = data.split('\n');
                lines.forEach(line => {
                    const [name, phone, note] = line.split(',');
                    if (name && phone) {
                        contacts.push({ name: name.trim(), phone: phone.trim(), note: note ? note.trim() : '' });
                    }
                });
            } else if (fileExt === '.xls' || fileExt === '.xlsx') {
                // Excel 파일 파싱
                const workbook = XLSX.readFile(filePath);
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);
                jsonData.forEach(row => {
                    const name = row['Name'] || row['이름'];
                    const phone = row['Phone'] || row['전화번호'];
                    const note = row['Note'] || row['메모'] || '';
                    if (name && phone) {
                        contacts.push({ name: name.trim(), phone: phone.trim(), note: note.trim() });
                    }
                });
            } else {
                throw new Error('지원하지 않는 파일 형식입니다.');
            }

            // 연락처 삽입
            const insertQuery = 'INSERT INTO contacts (address_book_id, name, phone, note) VALUES (?, ?, ?, ?)';
            const stmt = db.prepare(insertQuery);

            db.serialize(() => {
                contacts.forEach(contact => {
                    stmt.run([addressBookId, contact.name, contact.phone, contact.note]);
                });
                stmt.finalize((err) => {
                    if (err) {
                        console.error('연락처 삽입 오류:', err.message);
                        return res.status(500).json({ error: '연락처 삽입에 실패했습니다.' });
                    }
                    res.status(200).json({ message: '연락처가 성공적으로 업로드되었습니다.', importedContacts: contacts.length });
                });
            });

        } catch (error) {
            console.error('파일 파싱 오류:', error.message);
            return res.status(400).json({ error: '파일 파싱에 실패했습니다. 파일 형식을 확인하세요.' });
        } finally {
            // 업로드된 파일 삭제
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('파일 삭제 오류:', err.message);
                }
            });
        }
    });
});

// **연락처 목록 조회 라우트**
router.get('/:addressBookId', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const addressBookId = req.params.addressBookId;

    // 주소록 소유자 확인
    const checkQuery = 'SELECT * FROM address_books WHERE id = ? AND user_id = ?';
    db.get(checkQuery, [addressBookId, userId], (err, row) => {
        if (err) {
            console.error('주소록 확인 오류:', err.message);
            return res.status(500).json({ error: '주소록 확인에 실패했습니다.' });
        }
        if (!row) {
            return res.status(404).json({ error: '주소록을 찾을 수 없습니다.' });
        }

        const query = 'SELECT id, name, phone, note, created_at FROM contacts WHERE address_book_id = ?';
        db.all(query, [addressBookId], (err, rows) => {
            if (err) {
                console.error('연락처 조회 오류:', err.message);
                return res.status(500).json({ error: '연락처 조회에 실패했습니다.' });
            }
            res.status(200).json({ contacts: rows });
        });
    });
});

// **연락처 삭제 라우트 (선택 사항)**
router.delete('/:addressBookId/:contactId', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const addressBookId = req.params.addressBookId;
    const contactId = req.params.contactId;

    // 주소록 소유자 확인
    const checkQuery = 'SELECT * FROM address_books WHERE id = ? AND user_id = ?';
    db.get(checkQuery, [addressBookId, userId], (err, row) => {
        if (err) {
            console.error('주소록 확인 오류:', err.message);
            return res.status(500).json({ error: '주소록 확인에 실패했습니다.' });
        }
        if (!row) {
            return res.status(404).json({ error: '주소록을 찾을 수 없습니다.' });
        }

        // 연락처 소유자 확인
        const contactCheckQuery = 'SELECT * FROM contacts WHERE id = ? AND address_book_id = ?';
        db.get(contactCheckQuery, [contactId, addressBookId], (err, contactRow) => {
            if (err) {
                console.error('연락처 확인 오류:', err.message);
                return res.status(500).json({ error: '연락처 확인에 실패했습니다.' });
            }
            if (!contactRow) {
                return res.status(404).json({ error: '삭제할 연락처를 찾을 수 없습니다.' });
            }

            // 연락처 삭제
            const deleteQuery = 'DELETE FROM contacts WHERE id = ?';
            db.run(deleteQuery, [contactId], function(err) {
                if (err) {
                    console.error('연락처 삭제 오류:', err.message);
                    return res.status(500).json({ error: '연락처 삭제에 실패했습니다.' });
                }
                res.status(200).json({ message: '연락처가 성공적으로 삭제되었습니다.' });
            });
        });
    });
});

module.exports = router;
