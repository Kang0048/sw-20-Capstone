// frontend/script/loadModals.js

document.addEventListener("DOMContentLoaded", function () {
    loadModals(); // 모달을 로드
    // initializeEventListeners(); // 중복 호출 제거
    // setActiveMenuItem(); // 함수 정의 여부에 따라 제거 또는 정의
    const addPhoneButton = document.getElementById("addPhoneButton");
    const currentPath = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
    
    if (addPhoneButton) {
        addPhoneButton.addEventListener("click", addPhoneNumber);
    }

    // 파일 선택 시 이미지 업로드 처리
    const imageInput = document.getElementById("imageInput");
    if (imageInput) {
        imageInput.addEventListener("change", handleFileSelect);
    }

    navLinks.forEach(link => {
        // 현재 경로와 링크의 href 속성이 일치하는 경우 'active' 클래스 추가
        if (link.getAttribute("href") === currentPath) {
            link.classList.add("active");
        }
    });
});

// 모달을 로드한 후 이벤트 리스너를 초기화하는 함수
async function loadModals() {
    const modals = [
        './modal/messageModal.html',
        './modal/imageModal.html',
        './modal/phoneModal.html',
        './modal/sendModal.html',
        './modal/phoneaddressModal.html'
    ];
    const modalContainer = document.getElementById("modalContainer");

    try {
        for (const modal of modals) {
            const response = await fetch(modal);
            if (response.ok) {
                const modalHtml = await response.text();
                modalContainer.innerHTML += modalHtml;
            } else {
                console.error(`${modal} 파일을 찾을 수 없습니다:`, response.statusText);
            }
        }
        initializeEventListeners(); // 모달 로드가 완료된 후 이벤트 리스너 초기화
    } catch (error) {
        console.error("모달을 불러오는 데 실패했습니다:", error);
    }
}

// 모든 이벤트 리스너 초기화 함수 정의
function initializeEventListeners() {
    // 예: PhoneModal 관련 이벤트 리스너 설정
    const registerPhoneNumberButton = document.getElementById("registerPhoneNumber");
    if (registerPhoneNumberButton) {
        registerPhoneNumberButton.addEventListener("click", function () {
            const phoneNumber = document.getElementById("phoneNumberInput").value;
            const ownerName = document.getElementById("ownerInput").value;
            if (phoneNumber && ownerName) {
                document.getElementById("displayPhoneNumber").textContent = `발신번호: ${phoneNumber}, 명의자: ${ownerName}`;
                const phoneModal = bootstrap.Modal.getInstance(document.getElementById("PhoneModal"));
                phoneModal.hide();
            } else {
                alert("발신번호와 명의자를 모두 입력해주세요.");
            }
        });
    }

    // 필요에 따라 다른 모달과 요소의 이벤트 리스너도 여기에서 초기화합니다.
}
