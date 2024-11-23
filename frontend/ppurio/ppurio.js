const TIME_OUT = 5000;
const API_KEY = '6e84ebeb9c8eb9215c1d3f8de4de4fa7598cea2719f94ccb6a9109d35d4f5345';
const PPURIO_ACCOUNT = 'cap123';
const URI = 'https://message.ppurio.com';

// 메시지 전송 요청
export async function requestSend(to, from, name, content, image) {
    const basicAuthorization = btoa(`${PPURIO_ACCOUNT}:${API_KEY}`); // Base64 인코딩
    const tokenResponse = await getToken(URI, basicAuthorization);
    const sendResponse = await sendMessage(URI, tokenResponse.token, to, from, name, content, image);
    return sendResponse;
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
        throw new Error('토큰 발급 실패: ' + error.message);
    }
}

// 메시지 전송 요청 함수
async function sendMessage(baseUri, accessToken, to, from, name, content, image) {
    const bearerAuthorization = `Bearer ${accessToken}`;
    const sendParams = createSendParams(to, from, name, content, image);

    try {
        const response = await axios.post(`${baseUri}/v1/message`, sendParams, {
            headers: {
                Authorization: bearerAuthorization,
                'Content-Type': 'application/json',
            },
            timeout: TIME_OUT,
        });
        return response.data;
    } catch (error) {
        console.error('메시지 전송 실패:', error.response ? error.response.data : error.message);
        throw new Error('메시지 전송 실패: ' + error.message);
    }
}

// 메시지 전송 파라미터 생성 함수
function createSendParams(to, from, name, content, image) {
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

    if (image) {
        params.files = [createFileParams(image)];
    }

    return params;
}

// 파일 파라미터 생성 함수
function createFileParams(image) {
    return {
        size: image.size || 0,
        name: image.name || 'image.jpg',
        data: image.data || '',
    };
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

// 예약 취소 요청 함수
export async function requestCancel(messageKey) {
    const basicAuthorization = btoa(`${PPURIO_ACCOUNT}:${API_KEY}`);
    const tokenResponse = await getToken(URI, basicAuthorization);
    const cancelResponse = await cancelMessage(URI, tokenResponse.token, messageKey);
    return cancelResponse;
}

// 예약 취소 API 호출
async function cancelMessage(baseUri, accessToken, messageKey) {
    const bearerAuthorization = `Bearer ${accessToken}`;
    const cancelParams = { account: PPURIO_ACCOUNT, messageKey };

    try {
        const response = await axios.post(`${baseUri}/v1/cancel`, cancelParams, {
            headers: {
                Authorization: bearerAuthorization,
                'Content-Type': 'application/json',
            },
            timeout: TIME_OUT,
        });
        return response.data;
    } catch (error) {
        console.error('예약 취소 실패:', error.response ? error.response.data : error.message);
        throw new Error('예약 취소 실패: ' + error.message);
    }
}
