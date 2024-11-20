document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지

    // 입력 필드 값 가져오기
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const note = document.getElementById('note').value;

    // 새 연락처 항목 생성
    const contactItem = document.createElement('li');
    contactItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    contactItem.innerHTML = `
        <div>
            <strong>${name}</strong><br>
            <span>전화번호: ${phone}</span><br>
            <span>메모: ${note}</span>
        </div>
        <button class="btn btn-danger btn-sm delete-btn">삭제</button>
    `;

    // 연락처 목록에 추가
    document.getElementById('contactList').appendChild(contactItem);

    // 삭제 버튼 이벤트 추가
    contactItem.querySelector('.delete-btn').addEventListener('click', function () {
        contactItem.remove();
    });

    // 입력 필드 초기화
    document.getElementById('registerForm').reset();
});