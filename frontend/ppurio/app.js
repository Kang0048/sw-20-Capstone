// app.js

// 필요한 모듈 가져오기
const { requestSend } = require('./ppurio'); // ppurio 파일 이름이 맞는지 확인하세요.

// 발송 함수 실행
async function run() {
    try {
        console.log("메시지 발송 요청을 시작합니다...");
        
        // 문자 발송 인자 설정
        const to = '01040997586'; // 수신자 번호
        const from = '01040997586'; // 발신자 번호
        const name = '홍길동'; // 수신자 이름
        const content = '1+1 특가에 최대 3천원 쿠폰까지!\n역대급 특가로 그날 미리 챙겨두세요!';
        const filePath = './image.jpg'; // 이미지 파일 경로, 이미지가 없을 경우 null 설정 가능

        // 문자 발송 요청
        await requestSend(to, from, name, content, filePath);
        console.log("메시지 발송 요청이 완료되었습니다.");
    } catch (error) {
        console.error("오류가 발생했습니다:", error.message);
    }
}

// 실행 함수 호출
run();
