

document.addEventListener("DOMContentLoaded", function () {
    const modalButton = document.getElementById("open-msgModalButton"); // 모달 열기 버튼 ID
    const regionSelect = document.getElementById("regionDropdown"); // 드롭다운 ID

    if (modalButton) {
        modalButton.addEventListener("click", function () {
            if (regionSelect && !regionSelect.value) {
                regionSelect.value = "seoul"; // 기본값: 서울
            }
            updateWeatherWidget(); // 버튼 클릭 시 날씨 데이터 업데이트
        });
    } else {
        console.error("Modal open button not found.");
    }
});

async function updateWeatherWidget() {
    const regionSelect = document.getElementById("regionDropdown");

    // region select element가 없으면 함수 종료
    if (!regionSelect) {
        console.log("Region select element not found. Widget update skipped.");
        return;
    }

    const selectedValue = regionSelect.value || "seoul"; // 기본값: 서울
    const selectedText = regionSelect.options[regionSelect.selectedIndex]?.text || "서울";

    try {
        // API 요청
        const response = await fetch(`/api/weather?location=${encodeURIComponent(selectedValue)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // 하늘 상태 한국어 번역
        let descriptionKo = '';
        if (data.sky === 'Clear') {
            descriptionKo = '맑음';
        } else if (data.sky === 'Partly Cloudy') {
            descriptionKo = '부분 흐림';
        } else if (data.sky === 'Mostly Cloudy') {
            descriptionKo = '대체로 흐림';
        } else if (data.sky === 'Overcast') {
            descriptionKo = '흐림';
        } else {
            descriptionKo = '알 수 없음';
        }

        // 각 요소 존재 여부 확인 후 업데이트
        const elements = {
            "selected-value": selectedText,
            "avgTemp": `${data.avgTemp}°`,
            "minTemp": `${data.minTemp}°`,
            "maxTemp": `${data.maxTemp}°`,
            "sky": descriptionKo
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

    } catch (error) {
        console.error("날씨 위젯 업데이트 오류:", error);

        // 기본값 표시
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
