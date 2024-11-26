document.getElementById("registerForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const addressBookName = document.getElementById("addressBookName").value;
    const region = document.getElementById("region").value;
    const phoneNumbers = document.getElementById("phoneInput").value.trim().split("\n").map(phone => phone.trim()).filter(phone => phone !== "");

    // 유효한 전화번호 필터링
    const validPhoneNumbers = phoneNumbers.filter(phone => /^01[0-9]-?\d{3,4}-?\d{4}$/.test(phone));

    if (validPhoneNumbers.length === 0) {
        alert("유효한 휴대폰 번호를 입력해주세요.");
        return;
    }

    // 중복 번호 방지
    const isDuplicate = Array.from(contactList.children).some(item => validPhoneNumbers.some(phone => item.textContent.includes(phone)));

    if (isDuplicate) {
        alert("이미 등록된 번호가 있습니다.");
        return;
    }

    // 연락처 카드 생성
    const contactCard = document.createElement("div");
    contactCard.classList.add("contact-card");
    contactCard.innerHTML = `
        <div class="contact-card-header">
            ${addressBookName} (${region})
            <span class="badge">${validPhoneNumbers.length} 개의 수신번호</span>
        </div>
        <div class="contact-card-body">
            전화번호 목록을 클릭하여 확인하거나 편집하세요.
        </div>
        <div class="contact-card-footer">
            <button class="btn btn-outline-primary btn-sm">상세보기</button>
        </div>
    `;

    // 모달 초기화
    const contactModal = new bootstrap.Modal(document.getElementById('contactModal'));

    // 상세보기 버튼 클릭 시 모달 열기
    contactCard.addEventListener("click", function() {
        const modalAddressBookName = document.getElementById("modalAddressBookName");
        const modalRegion = document.getElementById("modalRegion");
        const modalPhoneNumbers = document.getElementById("modalPhoneNumbers");

        modalAddressBookName.textContent = addressBookName;
        modalRegion.textContent = region;
        modalPhoneNumbers.innerHTML = ""; // 모달 초기화
        validPhoneNumbers.forEach(phone => {
            const phoneItem = document.createElement("li");
            phoneItem.classList.add("phone-number-item");
            phoneItem.textContent = phone;
            modalPhoneNumbers.appendChild(phoneItem);
        });

        contactModal.show(); // 모달 열기
    });

    contactList.appendChild(contactCard);

    // Reset form
    document.getElementById("registerForm").reset();
});