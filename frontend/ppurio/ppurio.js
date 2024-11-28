// Axios는 브라우저에서 전역 객체로 로드되었음을 가정 (CDN을 통해)
// 설정 상수 선언
const TIME_OUT = 5000;
const API_KEY = '6e84ebeb9c8eb9215c1d3f8de4de4fa7598cea2719f94ccb6a9109d35d4f5345';
const PPURIO_ACCOUNT = 'cap123';
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

        // 이미지 데이터가 없으면 오류 발생
        if (!response.data || !response.data.data) {
            throw new Error('이미지 데이터를 가져오지 못했습니다.');
        }

        // Base64 데이터를 로드하여 이미지 처리
        const img = await loadImage(`data:image/jpeg;base64,${response.data.data}`);

        // Canvas 생성 및 이미지 처리
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // 초기 품질 설정
        let quality = 0.9;
        let jpegDataUrl = canvas.toDataURL('image/jpeg', quality);

        // 파일 크기 확인 및 품질 조정
        while (getFileSize(jpegDataUrl) > 400 * 1024 && quality > 0.1) {
            quality -= 0.1; // 품질을 낮춤
            jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Base64 데이터 추출
        const base64Data = jpegDataUrl.split(',')[1];

        console.log(`최종 JPEG 파일 크기: ${(getFileSize(jpegDataUrl) / 1024).toFixed(2)} KB`);

        return {
            size: getFileSize(jpegDataUrl),
            name: fileName,
            data: base64Data, // Base64 인코딩된 데이터
        };
    } catch (error) {
        throw new Error('이미지를 처리하는 중 오류가 발생했습니다: ' + error.message);
    }
}

// 이미지 로드 함수
function loadImage(base64Url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = base64Url;
    });
}

// Base64 데이터 크기 계산 함수
function getFileSize(base64DataUrl) {
    const base64Length = base64DataUrl.split(',')[1].length;
    return Math.ceil((base64Length * 3) / 4); // 바이트 단위 크기 계산
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
