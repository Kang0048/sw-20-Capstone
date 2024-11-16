const { getWeatherData } = require('./weather'); // weatherService.js 파일에서 함수 가져오기

// 이미지 프롬프트 생성 함수
function generateImagePrompt(weatherData) {
    const { sky, avgTemp, minTemp, maxTemp, location } = weatherData;

    // 날씨 상태에 따라 프롬프트 생성
    const prompt = `A ${sky.toLowerCase()} day in ${location}, with an average temperature of ${avgTemp}°C, ranging from a low of ${minTemp}°C to a high of ${maxTemp}°C.`;

    return prompt;
}

// 실행 함수
async function main() {
    const location = 'gwangju'; // 기본 지역 설정. 다른 지역 사용 시 이름 변경 ('gwangju', 'daegu' 등)
    
    try {

        const weatherData = await getWeatherData(location);
        const prompt = generateImagePrompt(weatherData);
        console.log(prompt);

        // 이미지 생성 API 호출 로직 (예제)
        // const imageResponse = await generateImage(prompt);
        // console.log('Generated Image:', imageResponse);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// 실행
main();
