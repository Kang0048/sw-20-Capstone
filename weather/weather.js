const request = require('request');
const moment = require('moment');

const serviceKey = 'u9djILD%2FxDioJMqtlTR7n0xl4ALy0rrGF4nyTKdGmAGZQ5PREnq4VbkP1wNnBf21m7XDE8mDDqI74NJEPjX2jQ%3D%3D';

const defaultStationX = 55; // 기본 예보지점 X 좌표 (예: 서울)
const defaultStationY = 127; // 기본 예보지점 Y 좌표 (예: 서울)

// SKY 코드 매핑
const skyCodeMapping = {
    '0': '맑음',
    '1': '구름 조금',
    '2': '구름 적당히',
    '3': '구름 많이',
    '4': '흐림'
};

// 날씨 데이터 요청 함수
async function getWeatherData(stationX = defaultStationX, stationY = defaultStationY) {
    const today = moment().format('YYYYMMDD');

    try {
        const [data0200, data1100] = await Promise.all([
            requestData(today, '0200', stationX, stationY),
            requestData(today, '1100', stationX, stationY)
        ]);

        // 데이터 정리
        const minTemp = data0200.minTemp;
        const avgTemp = data0200.avgTemp;
        const sky = skyCodeMapping[data0200.sky] || '알 수 없음'; // 매핑 적용
        const maxTemp = data1100.maxTemp;
        const pop = data1100.pop;

        return {
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