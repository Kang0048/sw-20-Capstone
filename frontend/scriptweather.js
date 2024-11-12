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

//핸드폰 번호 추가 버튼 이벤트 핸들러
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

//발신 번호 등록 페이지 함수
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


//발송하기 버튼을 눌렀을 때 함수
function updatePreviewContent() {
    // 제목 업데이트
    const titleContent = document.getElementById("title").value;
    document.querySelector(".display-title").textContent = titleContent;

    // 메시지 내용 업데이트
    const messageContent = document.getElementById("messageContent1").value;
    document.querySelector(".display-message").textContent = messageContent;

    // 이미지 업데이트
    const imageContainer = document.getElementById("imageUploadContainer");
    const previewContainer = document.querySelector(".image-preview");

    // imageUploadContainer에 이미지가 있는지 확인
    const imgElement = imageContainer.querySelector("img");
    if (imgElement) {
        const imageUrl = imgElement.src;

        // 이미지 미리보기 컨테이너에 배경 이미지로 설정
        previewContainer.style.backgroundImage = `url(${imageUrl})`;
        previewContainer.style.backgroundSize = "contain";
        previewContainer.style.backgroundRepeat = "no-repeat";
        previewContainer.style.backgroundPosition = "center";

        // 예시 텍스트 숨기기
        const placeholderText = previewContainer.querySelector("span");
        if (placeholderText) {
            placeholderText.style.display = "none";
        }
    } else {
        // 이미지가 없는 경우, 미리보기 초기화
        previewContainer.style.backgroundImage = "";
        previewContainer.querySelector("span").style.display = "block";
    }
}



//message 확정 함수
function confirmMessage() {
    // 확인 팝업을 띄움
    if (confirm("확정하시겠습니까?")) {
        // messageContent의 텍스트를 가져와 messageContent1에 설정
        const generatedContent = document.getElementById("messageContent").innerText;
        document.getElementById("messageContent1").value = generatedContent;

        // Bootstrap 모달 닫기 (jQuery가 아닌 JavaScript로 모달 닫기)
        const messageModal = document.getElementById("messageModal");
        const modal = bootstrap.Modal.getInstance(messageModal);
        modal.hide();
    }
}





// ai 생성 이미지 관련 함수
// 이미지 선택 함수
let selectedImageBoxId = null;
function selectImage(element) {
    // 이전에 선택된 이미지가 있다면 선택 해제
    if (selectedImageBoxId) {
        document.getElementById(selectedImageBoxId).classList.remove('selected');
    }

    // 현재 선택한 이미지에 선택 클래스 추가
    selectedImageBoxId = element.id;
    element.classList.add('selected');
}

function confirmSelection() {
    if (selectedImageBoxId) {
        const selectedImageUrl = document.getElementById(selectedImageBoxId).querySelector('img').src;

        // '확정하시겠습니까?' 확인 팝업
        if (confirm("확정하시겠습니까?")) {
            // 모달 닫기
            const modalElement = document.getElementById('imageModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();

            // 선택한 이미지를 imageUploadContainer에 추가하고 스타일 적용
            const imageContainer = document.getElementById("imageUploadContainer");
            imageContainer.innerHTML = `<img src="${selectedImageUrl}" class="img-fluid" style="max-width: 100%; max-height: 100%;">`;

            // 이미지에 맞춰 container 크기를 조절
            imageContainer.style.width = '250px';
            imageContainer.style.height = '250px';
            imageContainer.style.padding = '0';  // 여백을 없애서 이미지에 맞춤
        }
    } else {
        alert("이미지를 선택해주세요.");
    }
}

//이미지 관련 함수
function deleteImage() {
    const previewContainer = document.getElementById("imageUploadContainer");
    const uploadIcon = document.getElementById("uploadIcon");
    const deleteButton = document.getElementById("deleteImageButton");

    // 미리보기 이미지 제거
    previewContainer.style.backgroundImage = "none";

    // 업로드 아이콘 다시 표시 및 삭제 버튼 숨기기
    uploadIcon.style.display = "block";
    deleteButton.style.display = "none";

    // 파일 입력 필드 초기화
    document.getElementById("imageInput").value = "";
}
// imageUploadContainer 클릭 시 input 클릭
document.getElementById("imageUploadContainer").addEventListener("click", function () {
    document.getElementById("imageInput").click();
});

// 파일 선택 시 이미지 표시
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            // 이미지 표시
            const imageContainer = document.getElementById("imageUploadContainer");
            imageContainer.innerHTML = `<img src="${e.target.result}" class="img-fluid">`;
        };
        reader.readAsDataURL(file);
    }
}

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