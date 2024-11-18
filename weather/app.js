const { getWeatherData } = require('./weather'); // weatherService.js 파일에서 함수 가져오기

// 이미지 프롬프트 생성 함수
function generateImagePrompt(weatherData) {
    const { sky, avgTemp, minTemp, maxTemp, location, pty } = weatherData;

    // PTY에 따른 추가 설명
    const precipitation = pty !== 'None' ? `with ${pty.toLowerCase()} expected` : 'with no precipitation expected';

    // 날씨 상태에 따라 프롬프트 생성
    const prompt = `A ${sky.toLowerCase()} day in ${location}, ${precipitation}, with an average temperature of ${avgTemp}°C, ranging from a low of ${minTemp}°C to a high of ${maxTemp}°C.`;

    return prompt;
}

// 실행 함수
async function generateWeather( location ) {
    
    try {
        const weatherData = await getWeatherData(location);

        console.log('Weather data:', weatherData);

        const prompt = generateImagePrompt(weatherData);
        return prompt;
    } catch (error) {
        console.error('Error:', error.message);
    }
}

module.exports = { generateWeather };
