// app.js

// 필요한 모듈 가져오기
const { requestSend } = require('./ppurio'); // ppurio 파일 이름이 맞는지 확인하세요.

// 발송 함수 실행
async function run() {
    try {
        console.log("메시지 발송 요청을 시작합니다...");
        await requestSend();
        console.log("메시지 발송 요청이 완료되었습니다.");
    } catch (error) {
        console.error("오류가 발생했습니다:", error.message);
    }
}

// 실행 함수 호출
run();
