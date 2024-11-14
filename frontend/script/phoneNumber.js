// phoneNumber.js

// 핸드폰 번호 추가 함수
function addPhoneNumber() {
    const phoneInput = document.getElementById("phoneInput");
    const recipientList = document.getElementById("recipientList");
    const placeholderText = document.getElementById("placeholderText");
    const totalCount = document.getElementById("totalCount");

    const phoneNumbers = phoneInput.value.trim().split("\n");
    let validPhoneCount = 0;

    // 한국 휴대폰 번호 형식 검사
    const phonePattern = /^01[0-9]-?\d{3,4}-?\d{4}$/;

    phoneNumbers.forEach(phoneNumber => {
        const trimmedNumber = phoneNumber.trim();
        
        // 중복 번호 방지
        const isDuplicate = Array.from(recipientList.children).some(item => item.textContent === trimmedNumber);

        if (trimmedNumber && phonePattern.test(trimmedNumber) && !isDuplicate) {
            if (placeholderText) placeholderText.style.display = "none";

            // 번호 요소 생성
            const newPhone = document.createElement("div");
            newPhone.classList.add("recipient-item", "text-muted");
            newPhone.textContent = trimmedNumber;

            // 번호 삭제 기능 추가
            newPhone.addEventListener("click", () => {
                recipientList.removeChild(newPhone);
                updateTotalCount();
                if (recipientList.children.length === 0 && placeholderText) {
                    placeholderText.style.display = "block";
                }
            });

            recipientList.appendChild(newPhone);
            validPhoneCount++;
        } else if (isDuplicate) {
            alert(`중복된 번호가 있습니다: ${trimmedNumber}`);
        } else if (!phonePattern.test(trimmedNumber)) {
            alert(`유효하지 않은 번호 형식입니다: ${trimmedNumber}`);
        }
    });

    updateTotalCount();
    phoneInput.value = "";

    if (validPhoneCount === 0) {
        alert("유효한 휴대폰 번호를 입력해주세요.");
    }
}

// 총 인원 업데이트 함수
function updateTotalCount() {
    const totalCount = document.getElementById("totalCount");
    const recipientList = document.getElementById("recipientList");
    totalCount.textContent = `전체 ${recipientList.querySelectorAll(".recipient-item").length}명`;
}


// 발신 번호 등록 함수
function registerPhoneNumber() {
    const phoneNumber = document.getElementById("phoneNumberInput").value;
    const ownerName = document.getElementById("ownerInput").value;

    if (phoneNumber && ownerName) {
        document.getElementById("displayPhoneNumber").textContent = `발신번호: ${phoneNumber}, 명의자: ${ownerName}`;
        const phoneModal = bootstrap.Modal.getInstance(document.getElementById("PhoneModal"));
        phoneModal.hide();
    } else {
        alert("발신번호와 명의자를 모두 입력해주세요.");
    }
}
