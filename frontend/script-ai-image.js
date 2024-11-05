 // 현재 URL을 기준으로 활성화된 메뉴 항목 표시
 document.addEventListener("DOMContentLoaded", function () {
    const currentPath = window.location.pathname.split("/").pop(); // 현재 파일명 추출
    const menuItems = document.querySelectorAll(".navbar-nav .nav-link"); // 모든 메뉴 링크 선택

    menuItems.forEach(item => {
        if (item.getAttribute("href") === currentPath) {
            item.classList.add("active"); // URL이 일치하는 메뉴 항목에 active 클래스 추가
        }
    });
});
// imageUploadContainer 클릭 시 파일 입력 활성화
document.getElementById("imageUploadContainer").addEventListener("click", function () {
    document.getElementById("imageInput").click();
});

// 이미지 파일 선택 시 박스 크기를 이미지 크기에 맞춰 동적으로 조정
document.getElementById("imageInput").addEventListener("change", function (event) {
    const file = event.target.files[0]; // 선택한 파일
    if (file && file.type.startsWith("image/")) { // 파일이 이미지인지 확인
        const reader = new FileReader();

        // 파일이 로드되면 이미지 크기에 맞춰 박스 크기 조정
        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = function () {
                const container = document.getElementById("imageUploadContainer");
                container.style.width = "300px"; // 고정 너비
                container.style.height = "300px"; // 고정 높이
                container.style.backgroundImage = `url(${img.src})`;
                container.style.backgroundSize = "contain"; // 이미지 비율 유지하며 최대 크기 설정
                container.style.backgroundRepeat = "no-repeat";
                container.style.backgroundPosition = "center";
                document.getElementById("uploadIcon").style.display = "none"; // "+" 아이콘 숨김
            };
        };

        reader.readAsDataURL(file); // 파일을 읽어 Data URL로 변환
    }
});
document.getElementById("registerPhoneNumber").addEventListener("click", function () {
    // 입력된 발신번호와 명의자 가져오기
    const phoneNumber = document.getElementById("phoneNumberInput").value;
    const ownerName = document.getElementById("ownerInput").value;

    // 발신번호와 명의자 정보가 입력되었는지 확인
    if (phoneNumber && ownerName) {
        // 표시 영역 업데이트
        document.getElementById("displayPhoneNumber").textContent = `발신번호: ${phoneNumber}, 명의자: ${ownerName}`;

        // 모달 닫기
        const phoneModal = bootstrap.Modal.getInstance(document.getElementById("PhoneModal"));
        phoneModal.hide();
    } else {
        alert("발신번호와 명의자를 모두 입력해주세요.");
    }
});
document.getElementById("addPhoneButton").addEventListener("click", function () {
    const phoneInput = document.getElementById("phoneInput");
    const recipientList = document.getElementById("recipientList");
    const placeholderText = document.getElementById("placeholderText");
    const totalCount = document.getElementById("totalCount");

    // 줄바꿈으로 구분된 전화번호 배열
    const phoneNumbers = phoneInput.value.trim().split("\n");

    // 유효한 번호만 추가
    let validPhoneCount = 0;
    phoneNumbers.forEach(phoneNumber => {
        const trimmedNumber = phoneNumber.trim();
        if (trimmedNumber) {
            // "받는사람" 초기 메시지 숨기기
            if (placeholderText) {
                placeholderText.style.display = "none";
            }

            // 새로운 번호 요소 생성
            const newPhone = document.createElement("div");
            newPhone.classList.add("recipient-item", "text-muted");
            newPhone.textContent = trimmedNumber;

            // 번호 추가
            recipientList.appendChild(newPhone);
            validPhoneCount++;
        }
    });

    // 인원 수 업데이트
    const currentCount = recipientList.querySelectorAll(".recipient-item").length;
    totalCount.textContent = `전체 ${currentCount}명`;

    // 입력란 초기화
    phoneInput.value = "";

    // 번호가 입력되지 않았다면 경고 메시지 표시
    if (validPhoneCount === 0) {
        alert("유효한 휴대폰 번호를 입력해주세요.");
    }
});
// 확정 버튼 클릭 시 선택된 이미지를 imageUploadContainer에 표시하는 함수
function confirmSelection() {
    if (selectedImageUrl) {
        const imageUploadContainer = document.getElementById('imageUploadContainer');
        imageUploadContainer.style.backgroundImage = `url(${selectedImageUrl})`;
        imageUploadContainer.style.backgroundSize = "cover";
        imageUploadContainer.style.backgroundPosition = "center";
        
        // 기존 "+" 텍스트 숨김
        document.getElementById('uploadIcon').style.display = 'none';
    } else {
        alert("이미지를 선택해주세요.");
    }
}

