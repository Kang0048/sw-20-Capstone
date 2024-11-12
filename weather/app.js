// app.js

const { getWeatherData } = require('./weather');

// 실행 함수
async function run() {
    try {
        const weatherData = await getWeatherData();
        console.log('예측 평균 기온 (TMP):', weatherData.avgTemp);
        console.log('예측 최저 기온 (TMN):', weatherData.minTemp);
        console.log('예측 최고 기온 (TMX):', weatherData.maxTemp);
        console.log('예측 하늘 상태 (SKY):', weatherData.sky); 
        console.log('예측 강수 확률 (POP):', weatherData.pop);
    } catch (error) {
        console.error('오류:', error.message);
    }
}

// 실행
run();
