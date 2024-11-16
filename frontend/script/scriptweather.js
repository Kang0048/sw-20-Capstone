// URL 활성화 메뉴 표시 함수
function setActiveMenuItem() {
    const currentPath = window.location.pathname.split("/").pop();
    const menuItems = document.querySelectorAll(".navbar-nav .nav-link");

    menuItems.forEach(item => {
        if (item.getAttribute("href") === currentPath) {
            item.classList.add("active");
        }
    });
}
function updateWeatherWidget() {
    // 드롭다운에서 선택된 값 가져오기
    const selectedRegion = document.getElementById("region").value;

    // 날씨 위젯의 지역 이름 업데이트
    document.getElementById("selected-value").textContent = selectedRegion;

    // 지역에 따른 날씨 정보 업데이트 (예제 데이터)
    const weatherData = {
        서울: { avgTemp: "13°", sky: "흐림", maxTemp: "18°", minTemp: "10°" },
        부산: { avgTemp: "15°", sky: "맑음", maxTemp: "20°", minTemp: "12°" },
        인천: { avgTemp: "12°", sky: "흐림", maxTemp: "17°", minTemp: "8°" },
        대구: { avgTemp: "14°", sky: "맑음", maxTemp: "19°", minTemp: "11°" },
        광주: { avgTemp: "16°", sky: "구름 많음", maxTemp: "21°", minTemp: "13°" },
        대전: { avgTemp: "13°", sky: "비", maxTemp: "16°", minTemp: "9°" },
        울산: { avgTemp: "15°", sky: "맑음", maxTemp: "19°", minTemp: "11°" },
        세종: { avgTemp: "14°", sky: "흐림", maxTemp: "18°", minTemp: "10°" },
        제주도: { avgTemp: "17°", sky: "구름 많음", maxTemp: "22°", minTemp: "14°" },
    };

    // 선택된 지역에 대한 날씨 데이터 가져오기
    const selectedWeather = weatherData[selectedRegion] || {};

    // 날씨 위젯 업데이트
    document.getElementById("avgTemp").textContent = selectedWeather.avgTemp || "N/A";
    document.getElementById("sky").textContent = selectedWeather.sky || "N/A";
    document.getElementById("maxTemp").textContent = selectedWeather.maxTemp || "N/A";
    document.getElementById("minTemp").textContent = selectedWeather.minTemp || "N/A";
}