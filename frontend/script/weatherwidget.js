// weatherwidget.js

async function updateWeatherWidget() {
    const regionSelect = document.getElementById("region");
    
    // region select element가 없으면 함수 종료
    if (!regionSelect) {
        console.log("Region select element not found. Widget update skipped.");
        return;
    }

    const selectedValue = regionSelect.value;
    const selectedText = regionSelect.options[regionSelect.selectedIndex].text;

    try {
        // API 호출
        const response = await fetch(`/api/weather?location=${encodeURIComponent(selectedValue)}`);
        if (!response.ok) {
            throw new Error(`날씨 데이터를 가져오는데 실패했습니다: ${response.statusText}`);
        }

        const data = await response.json();

        // 각 요소 존재 여부 확인 후 업데이트
        const elements = {
            "selected-value": selectedText,
            "avgTemp": `${data.avgTemp}°`,
            "minTemp": `${data.minTemp}°`,
            "maxTemp": `${data.maxTemp}°`,
            "sky": data.sky
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        // 날씨 데이터를 이벤트로 전파
        const weatherEvent = new CustomEvent('weatherUpdated', {
            detail: {
                region: selectedValue,
                weather: data
            }
        });
        document.dispatchEvent(weatherEvent);

    } catch (error) {
        console.error('날씨 위젯 업데이트 오류:', error);
        
        // 에러 상태 표시 (요소 존재 여부 확인)
        const errorElements = {
            "selected-value": selectedText,
            "sky": "날씨 정보 없음",
            "avgTemp": "--°",
            "minTemp": "--°",
            "maxTemp": "--°"
        };

        Object.entries(errorElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }
}

// 이벤트 리스너 설정 함수
function setupEventListeners() {
    const regionSelect = document.getElementById('region');
    if (regionSelect) {
        regionSelect.addEventListener('change', updateWeatherWidget);
    }

    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
        imageModal.addEventListener('shown.bs.modal', updateWeatherWidget);
    }
}

// DOM이 완전히 로드된 후에만 초기화 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setupEventListeners();
        updateWeatherWidget();
    });
} else {
    // 이미 DOM이 로드된 경우 바로 실행
    setupEventListeners();
    updateWeatherWidget();
}

