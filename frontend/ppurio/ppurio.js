// Axios는 브라우저에서 전역 객체로 로드되었음을 가정 (CDN을 통해)
// 설정 상수 선언
const dotenv = require('dotenv');
const path = require('path');

// .env 파일의 API 키를 로드 (파일 경로 지정)
dotenv.config({ path: path.resolve(__dirname, '../../backend/touch.env') });

const TIME_OUT = 5000;
const API_KEY = process.env.API_KEY;
const PPURIO_ACCOUNT = process.env.PPURIO_ACCOUNT;
const PROXY_URL = 'http://localhost:5000/api/proxy'; // 프록시 서버 URL

// 문자 발송 요청 함수
export async function requestSend(to, from, name, content, filePath) {
    const tokenResponse = await getToken();
    const sendResponse = await send(tokenResponse.token, to, from, name, content, filePath);
    console.log('메시지 전송 성공:', sendResponse);
    return sendResponse;
}

// 토큰 발급 요청 함수
async function getToken() {
    try {
        const response = await axios.post(PROXY_URL, {
            url: 'https://message.ppurio.com/v1/token', // 실제 API URL
            method: 'POST',
            headers: {
                Authorization: `Basic ${btoa(`${PPURIO_ACCOUNT}:${API_KEY}`)}`,
                'Content-Type': 'application/json',
            },
            data: {},
        });
        return response.data;
    } catch (error) {
        console.error('토큰 발급 실패:', error.response?.data || error.message);
        throw new Error('토큰 발급 실패: ' + error.message);
    }
}

// 문자 발송 요청 함수
async function send(accessToken, to, from, name, content, filePath) {
    const sendParams = await createSendParams(to, from, name, content, filePath);

    console.log('전송 요청 데이터:', sendParams); // 디버깅용 로그

    try {
        const response = await axios.post(PROXY_URL, {
            url: 'https://message.ppurio.com/v1/message',
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            data: sendParams,
        });
        return response.data;
    } catch (error) {
        console.error('메시지 전송 실패:', error.response?.data || error.message);
        throw new Error('메시지 전송 실패: ' + error.message);
    }
}

// 발송 파라미터 생성 함수
async function createSendParams(to, from, name, content, filePath) {
    const params = {
        account: PPURIO_ACCOUNT,
        messageType: 'MMS',
        from,
        content,
        duplicateFlag: 'Y',
        rejectType: 'AD',
        targetCount: to.length,
        targets: to.map((recipient) => ({
            to: recipient,
            name: name || '발신자',
        })),
        refKey: generateRandomKey(),
    };

    // 파일 첨부가 있는 경우
    if (filePath) {
        const fileData = await createFileParams(filePath);
        params.files = [fileData];
    }

    return params;
}

// 파일 첨부 파라미터 생성 함수
async function createFileParams(filePath) {
    if (!filePath) {
        throw new Error('유효한 파일 경로가 없습니다.');
    }

    const fileName = 'image.jpg'; // 파일 이름 고정

    try {
        // 프록시 서버를 통해 이미지 데이터를 가져옴
        const response = await axios.post(PROXY_URL, {
            url: filePath,
            method: 'GET',
            headers: {
                Accept: 'image/*', // 이미지 데이터 요청
            },
        });

        // 이미지 데이터를 Base64로 변환
        if (!response.data || !response.data.data) {
            throw new Error('이미지 데이터를 가져오지 못했습니다.');
        }

        return {
            size: response.data.size,
            name: fileName,
            data: response.data.data, // Base64 인코딩된 데이터
        };
    } catch (error) {
        throw new Error('이미지를 처리하는 중 오류가 발생했습니다: ' + error.message);
    }
}

// 랜덤 키 생성 함수
function generateRandomKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
