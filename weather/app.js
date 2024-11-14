const { getWeatherData } = require('./weather'); // weatherService 파일을 import

async function generateImagePrompt() {
    try {
        // 날씨 데이터 가져오기 (서울 좌표 예시 사용)
        const weatherData = await getWeatherData();

        // 날씨 정보에 따라 프롬프트 구성
        const { avgTemp, minTemp, maxTemp, sky, pop } = weatherData;

        // 기본 프롬프트 설정
        let prompt = `Today's weather: `;

        // 프롬프트에 조건 추가
        prompt += `${sky}, `;
        prompt += `Average temperature is ${avgTemp}°C, `;
        prompt += `Minimum temperature is ${minTemp}°C, `;
        prompt += `Maximum temperature is ${maxTemp}°C, `;
        prompt += `Chance of rain is ${pop}%.`;

        // 이미지 스타일 및 배경 텍스트
        let stylePrompt = '';
        if (sky === '맑음') {
            stylePrompt = 'a bright, sunny scene with clear skies';
        } else if (sky === '구름 조금') {
            stylePrompt = 'a slightly cloudy sky with sunshine peeking through';
        } else if (sky === '구름 적당히') {
            stylePrompt = 'a moderately cloudy sky with some sunlight';
        } else if (sky === '구름 많이') {
            stylePrompt = 'an overcast scene with dense clouds';
        } else if (sky === '흐림') {
            stylePrompt = 'a cloudy and overcast day';
        }

        // 최종 이미지 프롬프트
        const finalPrompt = `${prompt} The image should depict ${stylePrompt}.`;

        console.log(finalPrompt);
        return finalPrompt;

    } catch (error) {
        console.error('Error generating image prompt:', error);
    }
}

module.exports = { generateImagePrompt }
