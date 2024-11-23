// 필요한 상수
const TIME_OUT = 5000;
const API_KEY = '6e84ebeb9c8eb9215c1d3f8de4de4fa7598cea2719f94ccb6a9109d35d4f5345';
const PPURIO_ACCOUNT = 'cap123';
const URI = 'https://message.ppurio.com';

// 문자 발송 요청 함수
export async function requestSend(to, from, name, content, file) {
    const basicAuthorization = btoa(`${PPURIO_ACCOUNT}:${API_KEY}`);
    const tokenResponse = await getToken(URI, basicAuthorization);
    const sendResponse = await send(URI, tokenResponse.token, to, from, name, content, file);
    console.log(sendResponse);
}

// 토큰 발급 요청 함수
async function getToken(baseUri, basicAuthorization) {
    try {
        const response = await axios.post(`${baseUri}/v1/token`, {}, {
            headers: {
                Authorization: `Basic ${basicAuthorization}`,
                'Content-Type': 'application/json',
            },
            timeout: TIME_OUT,
        });
        return response.data;
    } catch (error) {
        console.error('토큰 발급 실패:', error.response ? error.response.data : error.message);
        throw new Error('API 요청과 응답 실패: ' + error.message);
    }
}

// 문자 발송 요청 함수
async function send(baseUri, accessToken, to, from, name, content, file) {
    const bearerAuthorization = `Bearer ${accessToken}`;
    try {
        const sendParams = createSendTestParams(to, from, name, content, file);
        const response = await axios.post(`${baseUri}/v1/message`, sendParams, {
            headers: {
                Authorization: bearerAuthorization,
                'Content-Type': 'application/json',
            },
            timeout: TIME_OUT,
        });
        return response.data;
    } catch (error) {
        console.error('메시지 발송 실패:', error.response ? error.response.data : error.message);
        throw new Error('API 요청과 응답 실패: ' + error.message);
    }
}

// 발송 파라미터 생성 함수
function createSendTestParams(to, from, name, content, file) {
    const sendParams = {
        account: PPURIO_ACCOUNT,
        messageType: 'MMS',
        from: from,
        content: content,
        duplicateFlag: 'Y',
        rejectType: 'AD',
        targetCount: 1,
        targets: [{ to: to, name: name }],
        refKey: cryptoRandomString(16),
    };

    // 파일이 있을 경우 추가
    if (file) {
        sendParams.files = [createFileTestParams(file)];
    }
    return sendParams;
}

// 파일 첨부 파라미터 생성 함수
function createFileTestParams(file) {
    return {
        size: file.size,
        name: file.name,
        data: file.data,
    };
}

// 랜덤 문자열 생성 함수 (Node.js의 crypto.randomBytes 대체)
function cryptoRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
