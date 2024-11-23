document.addEventListener("DOMContentLoaded", function () {
    const modalButton = document.getElementById("open-msgModalButton"); // 모달을 여는 버튼 ID

    if (modalButton) {
        modalButton.addEventListener("click", function () {
            setTimeout(() => {
                const messageModal = document.getElementById("messageModal");
                const regionSelect = document.getElementById("regionDropdown");

                if (messageModal) {
                    // 모달 열릴 때 초기화
                    messageModal.addEventListener("shown.bs.modal", () => {
                        if (regionSelect && !regionSelect.value) {
                            regionSelect.value = "seoul"; // 기본값 설정
                        }
                        updateWeatherWidgetModal(); // 날씨 데이터 업데이트
                    });
                } else {
                    console.error("Message modal not found after button click.");
                }
            }, 0); // 모달 DOM이 생성될 시간을 확보
        });
    } else {
        console.error("Modal open button not found.");
    }
});

async function updateWeatherWidgetModal() {
    const regionSelect = document.getElementById("regionDropdown");
    
    // regionDropdown 요소 확인
    if (!regionSelect) {
        console.error("Region dropdown element not found. Widget update skipped.");
        return;
    }

    const selectedValue = regionSelect.value || "seoul"; // 기본값: 서울
    const selectedText = regionSelect.options[regionSelect.selectedIndex]?.text || "서울";

    try {
        const response = await fetch(`/api/weather?location=${encodeURIComponent(selectedValue)}`);
        if (!response.ok) {
            throw new Error(`날씨 데이터를 가져오는데 실패했습니다: ${response.statusText}`);
        }

        const data = await response.json();

        // UI 업데이트
        const elements = {
            "selected-value-messageModal": selectedText,
            "avgTemp-messageModal": `${data.avgTemp}°`,
            "minTemp-messageModal": `${data.minTemp}°`,
            "maxTemp-messageModal": `${data.maxTemp}°`,
            "sky-messageModal": data.sky
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
            "selected-value-messageModal": selectedText,
            "sky-messageModal": "날씨 정보 없음",
            "avgTemp-messageModal": "--°",
            "minTemp-messageModal": "--°",
            "maxTemp-messageModal": "--°"
        };

        Object.entries(errorElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }
}
