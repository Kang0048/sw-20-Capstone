const request = require('request');
const moment = require('moment');

const serviceKey = 'u9djILD%2FxDioJMqtlTR7n0xl4ALy0rrGF4nyTKdGmAGZQ5PREnq4VbkP1wNnBf21m7XDE8mDDqI74NJEPjX2jQ%3D%3D';

// 지역별 X, Y 좌표 매핑
const locationMapping = {
    seoul: { x: 55, y: 127 },
    gwangju: { x: 59, y: 74 },
    daegu: { x: 89, y: 91 },
    daejeon: { x: 67, y: 100 },
    busan: { x: 98, y: 75 },
    ulsan: { x: 102, y: 84 },
    incheon: { x: 54, y: 125 }
};

// SKY 코드 매핑 (범위 기반, 영어)
function mapSkyCode(skyCode) {
    if (skyCode === '0') {
        return 'Clear';
    } else if (['1', '2', '3', '4'].includes(skyCode)) {
        return 'Partly Cloudy';
    } else if (['5', '6', '7', '8'].includes(skyCode)) {
        return 'Mostly Cloudy';
    } else if (['9', '10'].includes(skyCode)) {
        return 'Overcast';
    } else {
        return 'Unknown';
    }
}

// 날씨 데이터 요청 함수
async function getWeatherData(location = 'seoul') {
    const today = moment().format('YYYYMMDD');

    // 설정된 지역의 좌표 가져오기
    const { x: stationX, y: stationY } = locationMapping[location] || locationMapping.seoul;

    try {
        const [data0200, data1100] = await Promise.all([
            requestData(today, '0200', stationX, stationY),
            requestData(today, '1100', stationX, stationY)
        ]);

        // 데이터 정리
        const minTemp = data0200.minTemp;
        const avgTemp = data0200.avgTemp;
        const sky = mapSkyCode(data0200.sky); // 범위 기반 SKY 매핑 적용
        const maxTemp = data1100.maxTemp;
        const pop = data1100.pop;

        return {
            location,
            avgTemp,
            minTemp,
            maxTemp,
            sky,
            pop
        };
    } catch (error) {
        throw new Error('데이터 요청 중 오류 발생: ' + error);
    }
}

// 데이터를 요청하는 내부 함수 (Promise 기반)
function requestData(baseDate, baseTime, stationX, stationY) {
    return new Promise((resolve, reject) => {
        const url = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst`;
        const queryParams = `?serviceKey=${serviceKey}&numOfRows=100&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${stationX}&ny=${stationY}`;

        request({
            url: url + queryParams,
            method: 'GET'
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                try {
                    const data = JSON.parse(body);
                    if (data.response && data.response.body && data.response.body.items && data.response.body.items.item) {
                        const items = data.response.body.items.item;

                        let tempData = { minTemp: null, maxTemp: null, avgTemp: null, sky: null, pop: null };

                        items.forEach(item => {
                            if (item.category === 'TMP' && !tempData.avgTemp) tempData.avgTemp = item.fcstValue;
                            if (item.category === 'TMN' && !tempData.minTemp) tempData.minTemp = item.fcstValue;
                            if (item.category === 'TMX' && !tempData.maxTemp) tempData.maxTemp = item.fcstValue;
                            if (item.category === 'SKY' && !tempData.sky) tempData.sky = item.fcstValue;
                            if (item.category === 'POP' && !tempData.pop) tempData.pop = item.fcstValue;
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

module.exports = { getWeatherData };
