const request = require('request');
const moment = require('moment');
const dotenv = require('dotenv'); // dotenv 불러오기

// .env 파일의 API 키를 로드
dotenv.config({ path: path.resolve(__dirname, '../backend/touch.env') });

// 기상청 API 서비스 키를 환경 변수에서 가져오기
const serviceKey = process.env.WEATHER_SERVICE_KEY;

// 지역별 X, Y 좌표 매핑
// 기상청 API에서 사용하는 좌표로 변환
const locationMapping = {
    seoul: { x: 55, y: 127 },
    gwangju: { x: 59, y: 74 },
    daegu: { x: 89, y: 91 },
    daejeon: { x: 67, y: 100 },
    busan: { x: 98, y: 75 },
    ulsan: { x: 102, y: 84 },
    incheon: { x: 54, y: 125 },
    sejong: { x: 66, y: 103 },
    jeju: { x: 52, y: 38 }
};

// 유효한 base_time 리스트
// 기상청 API의 예보 기준 시간
const validBaseTimes = ['0200', '0500', '0800', '1100', '1400', '1700', '2000', '2300'];

// SKY 코드 매핑 (하늘 상태)
// 기상청에서 제공하는 SKY 코드를 해석하여 영어로 반환
function mapSkyCode(skyCode) {
    if (skyCode === '0') {
        return 'Clear'; // 맑음
    } else if (['1', '2', '3'].includes(skyCode)) {
        return 'Partly Cloudy'; // 부분적으로 흐림
    } else if (['4', '5', '6', '7', '8'].includes(skyCode)) {
        return 'Mostly Cloudy'; // 대체로 흐림
    } else if (['9', '10'].includes(skyCode)) {
        return 'Overcast'; // 흐림
    } else {
        return 'Unknown'; // 알 수 없음
    }
}

// PTY 결정 함수
// 강수 형태(비, 눈 등)를 결정
function determinePty(ptyValues, skyValue) {
    const counts = { clear: 0, rain: 0, snow: 0 };

    // PTY 값 카운트
    ptyValues.forEach(pty => {
        switch (pty) {
            case '0': counts.clear++; break; // 비 없음
            case '1': case '2': case '4': counts.rain++; break; // 비 관련 코드
            case '3': counts.snow++; break; // 눈
        }
    });

    // 강수 형태 결정
    if (counts.rain === 0 && counts.snow === 0) return mapSkyCode(skyValue); // 비가 없으면 하늘 상태 사용
    if (counts.rain > counts.snow) return 'Rain'; // 비가 더 많으면 비
    if (counts.snow > counts.rain) return 'Snow'; // 눈이 더 많으면 눈
    return 'Rain'; // 기본값으로 비
}

// 계절 계산 함수 (한국 기준)
// 현재 날짜를 기준으로 계절을 반환
function getSeason() {
    const today = moment();
    const year = today.year();

    // 계절 시작 날짜 정의
    const springStart = moment(`${year}-02-04`);
    const summerStart = moment(`${year}-05-05`);
    const autumnStart = moment(`${year}-08-07`);
    const winterStart = moment(`${year}-11-07`);

    // 계절 판별
    if (today.isBetween(springStart, summerStart, null, '[)')) {
        return 'spring'; // 봄
    } else if (today.isBetween(summerStart, autumnStart, null, '[)')) {
        return 'summer'; // 여름
    } else if (today.isBetween(autumnStart, winterStart, null, '[)')) {
        return 'autumn'; // 가을
    } else {
        return 'winter'; // 겨울
    }
}

// 데이터를 요청하는 내부 함수 (Promise 기반)
// 기상청 API에 데이터를 요청하고 결과를 반환
function requestData(baseDate, baseTime, stationX, stationY) {
    return new Promise((resolve, reject) => {
        const url = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst`;
        const queryParams = `?serviceKey=${serviceKey}&numOfRows=100&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${stationX}&ny=${stationY}`;

        // HTTP GET 요청
        request({
            url: url + queryParams,
            method: 'GET'
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                try {
                    const data = JSON.parse(body);
                    if (data.response && data.response.body && data.response.body.items && data.response.body.items.item) {
                        const items = data.response.body.items.item;

                        // 필요한 데이터를 추출하여 반환
                        let tempData = { minTemp: null, maxTemp: null, avgTemp: null, sky: null, pop: null, pty: null };

                        items.forEach(item => {
                            if (item.category === 'TMP' && !tempData.avgTemp) tempData.avgTemp = item.fcstValue;
                            if (item.category === 'TMN' && !tempData.minTemp) tempData.minTemp = item.fcstValue;
                            if (item.category === 'TMX' && !tempData.maxTemp) tempData.maxTemp = item.fcstValue;
                            if (item.category === 'SKY' && !tempData.sky) tempData.sky = item.fcstValue;
                            if (item.category === 'POP' && !tempData.pop) tempData.pop = item.fcstValue;
                            if (item.category === 'PTY' && !tempData.pty) tempData.pty = item.fcstValue;
                        });

                        resolve(tempData);
                    } else {
                        reject('날씨 데이터를 찾을 수 없습니다.');
                    }
                } catch (e) {
                    reject('JSON 파싱 오류: ' + e);
                }
            } else {
                reject('데이터 요청 중 오류 발생: ' + (error || `상태 코드: ${response.statusCode}`));
            }
        });
    });
}

// 날씨 데이터 요청 함수
// 지역별로 날씨 데이터를 가져오고 필요한 정보를 반환
async function getWeatherData(location) {
    const today = moment().format('YYYYMMDD');
    const { x: stationX, y: stationY } = locationMapping[location] || locationMapping.seoul;

    try {
        // 모든 base_time에서 데이터를 요청
        const tempPromises = validBaseTimes.map(baseTime => requestData(today, baseTime, stationX, stationY).catch(() => null));
        const tempData = await Promise.all(tempPromises);

        // 유효한 TMN 값 찾기
        const minTemps = tempData.filter(data => data && data.minTemp !== null).map(data => data.minTemp);

        // 최저 기온 설정 (첫 번째 유효한 값)
        const minTemp = minTemps.length > 0 ? minTemps[0] : null;

        // 특정 base_time 데이터 가져오기 (1100 사용)
        const specificData = await requestData(today, '1100', stationX, stationY);

        if (!specificData) throw new Error('유효한 데이터를 가져올 수 없습니다.');

        // PTY 결정
        const pty = determinePty([specificData.pty], specificData.sky);

        // 데이터 정리 및 반환
        return {
            location,
            avgTemp: specificData.avgTemp,
            minTemp,
            maxTemp: specificData.maxTemp,
            sky: mapSkyCode(specificData.sky),
            pop: specificData.pop,
            pty,
            season: getSeason()
        };
    } catch (error) {
        throw new Error('데이터 요청 중 오류 발생: ' + error.message);
    }
}

module.exports = { getWeatherData };
