const request = require('request');
const moment = require('moment');

const serviceKey = 'u9djILD%2FxDioJMqtlTR7n0xl4ALy0rrGF4nyTKdGmAGZQ5PREnq4VbkP1wNnBf21m7XDE8mDDqI74NJEPjX2jQ%3D%3D';
const stationX = 55; // 예보지점 X 좌표 (예: 서울)
const stationY = 127; // 예보지점 Y 좌표 (예: 서울)
const today = moment().format('YYYYMMDD');

// 병렬 요청
Promise.all([requestData('0200'), requestData('1100')])
    .then(([data0200, data1100]) => {
        // 0200 시각에서 얻은 데이터
        const minTemp = data0200.minTemp;
        const avgTemp = data0200.avgTemp;
        const sky = data0200.sky;

        // 1100 시각에서 얻은 최고 기온
        const maxTemp = data1100.maxTemp;

        // 결과 출력
        console.log('예측 평균 기온 (TMP):', avgTemp);
        console.log('예측 최저 기온 (TMN):', minTemp);
        console.log('예측 최고 기온 (TMX):', maxTemp);
        console.log('예측 하늘 상태 (SKY):', sky);
    })
    .catch(error => console.log('데이터 요청 중 오류 발생:', error));

// 데이터를 요청하는 함수 (Promise 기반)
function requestData(baseTime) {
    return new Promise((resolve, reject) => {
        const url = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst`;
        const queryParams = `?serviceKey=${serviceKey}&numOfRows=100&pageNo=1&dataType=JSON&base_date=${today}&base_time=${baseTime}&nx=${stationX}&ny=${stationY}`;

        request({
            url: url + queryParams,
            method: 'GET'
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                try {
                    const data = JSON.parse(body);
                    if (data.response && data.response.body && data.response.body.items && data.response.body.items.item) {
                        const items = data.response.body.items.item;

                        let tempData = { minTemp: null, maxTemp: null, avgTemp: null, sky: null };
                        
                        items.forEach(item => {
                            if (item.category === 'TMP' && !tempData.avgTemp) tempData.avgTemp = item.fcstValue;
                            if (item.category === 'TMN' && !tempData.minTemp) tempData.minTemp = item.fcstValue;
                            if (item.category === 'TMX' && !tempData.maxTemp) tempData.maxTemp = item.fcstValue;
                            if (item.category === 'SKY' && !tempData.sky) tempData.sky = item.fcstValue;
                        });

                        resolve(tempData);
                    } else {
                        reject('날씨 데이터를 찾을 수 없습니다.');
                    }
                } catch (e) {
                    reject('JSON 파싱 오류:', e);
                }
            } else {
                reject('데이터 요청 중 오류 발생:', error || `상태 코드: ${response.statusCode}`);
            }
        });
    });
}
