// 필요한 라이브러리 가져오기
const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');

// 설정 상수 선언
const TIME_OUT = 5000;
const API_KEY = '6e84ebeb9c8eb9215c1d3f8de4de4fa7598cea2719f94ccb6a9109d35d4f5345';
const PPURIO_ACCOUNT = 'cap123';
const FROM = '01040997586';
const FILE_PATH = './image.jpg'; // MMS 발송시 첨부할 이미지 경로를 설정합니다.
const URI = 'https://message.ppurio.com';

// 문자 발송 요청 함수
async function requestSend() {
    const basicAuthorization = Buffer.from(`${PPURIO_ACCOUNT}:${API_KEY}`).toString('base64');
    const tokenResponse = await getToken(URI, basicAuthorization); 
    const sendResponse = await send(URI, tokenResponse.token); 
    console.log(sendResponse);
}

// 문자 발송 예약 취소 함수
async function requestCancel() {
    const basicAuthorization = Buffer.from(`${PPURIO_ACCOUNT}:${API_KEY}`).toString('base64');
    const tokenResponse = await getToken(URI, basicAuthorization); 
    const cancelResponse = await cancel(URI, tokenResponse.token); 
    console.log(cancelResponse);
}

// 토큰 발급 요청 함수
async function getToken(baseUri, basicAuthorization) {
    try {
        const response = await axios.post(`${baseUri}/v1/token`, {}, {
            headers: {
                Authorization: `Basic ${basicAuthorization}`,
                'Content-Type': 'application/json'
            },
            timeout: TIME_OUT
        });
        return response.data;
    } catch (error) {
        console.error('토큰 발급 실패:', error.response ? error.response.data : error.message);
        throw new Error('API 요청과 응답 실패: ' + error.message);
    }
}

// 문자 발송 요청 함수
async function send(baseUri, accessToken) {
    const bearerAuthorization = `Bearer ${accessToken}`;
    try {
        const response = await axios.post(`${baseUri}/v1/message`, createSendTestParams(), {
            headers: {
                Authorization: bearerAuthorization,
                'Content-Type': 'application/json'
            },
            timeout: TIME_OUT
        });
        return response.data;
    } catch (error) {
        console.error('메시지 발송 실패:', error.response ? error.response.data : error.message);
        throw new Error('API 요청과 응답 실패: ' + error.message);
    }
}

// 예약 발송 취소 요청 함수
async function cancel(baseUri, accessToken) {
    const bearerAuthorization = `Bearer ${accessToken}`;
    try {
        const response = await axios.post(`${baseUri}/v1/cancel`, createCancelTestParams(), {
            headers: {
                Authorization: bearerAuthorization,
                'Content-Type': 'application/json'
            },
            timeout: TIME_OUT
        });
        return response.data;
    } catch (error) {
        console.error('예약 취소 실패:', error.response ? error.response.data : error.message);
        throw new Error('API 요청과 응답 실패: ' + error.message);
    }
}

// 발송 테스트 파라미터 생성 함수
function createSendTestParams() {
    const sendParams = {
        account: PPURIO_ACCOUNT,
        messageType: 'MMS',
        from: FROM,
        content: '[*이름*], hello this is [*1*]',
        duplicateFlag: 'Y',
        rejectType: 'AD',
        targetCount: 1,
        targets: [{
            to: '01040997586',
            name: 'tester',
            changeWord: { var1: 'ppurio api world' }
        }],
        refKey: crypto.randomBytes(16).toString('hex')
    };
    
    // 파일이 있을 때만 files 필드 추가
    if (FILE_PATH) {
        sendParams.files = [createFileTestParams(FILE_PATH)];
    }
    return sendParams;
}

// 파일 첨부 파라미터 생성 함수
function createFileTestParams(filePath) {
    try {
        const file = fs.readFileSync(filePath);
        return {
            size: file.length,
            name: filePath.split('/').pop(),
            data: file.toString('base64')
        };
    } catch (error) {
        throw new Error('파일을 가져오는데 실패했습니다: ' + error.message);
    }
}

// 예약 취소 파라미터 생성 함수
function createCancelTestParams() {
    return {
        account: PPURIO_ACCOUNT,
        messageKey: '230413110135117SMS029914servsUBn'
    };
}

// 외부에서 함수를 호출할 수 있도록 모듈 내보내기
module.exports = { requestSend, requestCancel };
