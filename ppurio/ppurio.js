// 필요한 라이브러리 가져오기
const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');

// 설정 상수 선언
const TIME_OUT = 5000;
const API_KEY = '6e84ebeb9c8eb9215c1d3f8de4de4fa7598cea2719f94ccb6a9109d35d4f5345';
const PPURIO_ACCOUNT = 'cap123';
const FROM = '01040997586';
const FILE_PATH = '{MMS 발송인 경우 첨부할 이미지 경로}';
const URI = 'https://message.ppurio.com';

// 문자 발송 요청 함수
async function requestSend() {
    // 기본 인증 헤더 생성
    const basicAuthorization = Buffer.from(`${PPURIO_ACCOUNT}:${API_KEY}`).toString('base64');
    // 토큰 발급 요청
    const tokenResponse = await getToken(URI, basicAuthorization); 
    // 발송 요청
    const sendResponse = await send(URI, tokenResponse.token); 
    console.log(sendResponse);
}

// 문자 발송 예약 취소 함수
async function requestCancel() {
    const basicAuthorization = Buffer.from(`${PPURIO_ACCOUNT}:${API_KEY}`).toString('base64');
    // 토큰 발급 요청
    const tokenResponse = await getToken(URI, basicAuthorization); 
    // 예약 취소 요청
    const cancelResponse = await cancel(URI, tokenResponse.token); 
    console.log(cancelResponse);
}

// 토큰 발급 요청 함수
async function getToken(baseUri, basicAuthorization) {
    try {
        // axios를 사용하여 POST 요청
        const response = await axios.post(`${baseUri}/v1/token`, {}, {
            headers: {
                Authorization: `Basic ${basicAuthorization}`,
                'Content-Type': 'application/json'
            },
            timeout: TIME_OUT
        });
        return response.data; // 응답 데이터 반환
    } catch (error) {
        throw new Error('API 요청과 응답 실패: ' + error.message);
    }
}

// 문자 발송 요청 함수
async function send(baseUri, accessToken) {
    const bearerAuthorization = `Bearer ${accessToken}`;
    try {
        // 발송 파라미터와 함께 axios POST 요청
        const response = await axios.post(`${baseUri}/v1/message`, createSendTestParams(), {
            headers: {
                Authorization: bearerAuthorization,
                'Content-Type': 'application/json'
            },
            timeout: TIME_OUT
        });
        return response.data;
    } catch (error) {
        throw new Error('API 요청과 응답 실패: ' + error.message);
    }
}

// 예약 발송 취소 요청 함수
async function cancel(baseUri, accessToken) {
    const bearerAuthorization = `Bearer ${accessToken}`;
    try {
        // 취소 파라미터와 함께 axios POST 요청
        const response = await axios.post(`${baseUri}/v1/cancel`, createCancelTestParams(), {
            headers: {
                Authorization: bearerAuthorization,
                'Content-Type': 'application/json'
            },
            timeout: TIME_OUT
        });
        return response.data;
    } catch (error) {
        throw new Error('API 요청과 응답 실패: ' + error.message);
    }
}

// 발송 테스트 파라미터 생성 함수
function createSendTestParams() {
    return {
        account: PPURIO_ACCOUNT,
        messageType: 'MMS', // 메시지 유형
        from: FROM,
        content: '[*이름*], hello this is [*1*]',
        duplicateFlag: 'Y', // 중복 메시지 발송 여부
        rejectType: 'AD', // 광고성 메시지 수신 거부 설정
        targetCount: 1,
        targets: [{
            to: '010XXXXXXXX',
            name: 'tester',
            changeWord: { var1: 'ppurio api world' }
        }],
        files: [createFileTestParams(FILE_PATH)], // 파일 첨부
        refKey: crypto.randomBytes(16).toString('hex') // 32자의 랜덤 키 생성
    };
}

// 파일 첨부 파라미터 생성 함수
function createFileTestParams(filePath) {
    try {
        // 파일을 base64로 인코딩하여 첨부할 데이터 생성
        const file = fs.readFileSync(filePath);
        return {
            size: file.length,
            name: filePath.split('/').pop(), // 파일 이름
            data: file.toString('base64') // 파일 내용 인코딩
        };
    } catch (error) {
        throw new Error('파일을 가져오는데 실패했습니다: ' + error.message);
    }
}

// 예약 취소 파라미터 생성 함수
function createCancelTestParams() {
    return {
        account: PPURIO_ACCOUNT,
        messageKey: '230413110135117SMS029914servsUBn' // 취소할 메시지의 고유 키
    };
}

// 외부에서 함수를 호출할 수 있도록 모듈 내보내기
module.exports = { requestSend, requestCancel };
