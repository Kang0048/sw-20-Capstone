// frontend/script/addressBookDetail.js

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const addressBookId = urlParams.get('addressBookId');

    const addressBookName = document.getElementById('addressBookName');
    const addressBookRegion = document.getElementById('addressBookRegion');
    const contactList = document.getElementById('contactList');
    const addContactForm = document.getElementById('addContactForm');

    if (!addressBookId) {
        alert('주소록 ID가 없습니다.');
        window.location.href = 'number.html';
        return;
    }

    // 주소록 정보 및 연락처 목록 로드
    async function loadAddressBookDetails() {
        try {
            const response = await fetch(`/address_book/${addressBookId}/contacts`, {
                method: 'GET',
                credentials: 'include'
            });

            const result = await response.json();

            if (response.ok) {
                // 주소록 정보 설정
                addressBookName.textContent = result.addressBook.name;
                addressBookRegion.textContent = result.addressBook.region ? `- ${result.addressBook.region}` : '';

                // 연락처 목록 설정
                contactList.innerHTML = '';

                if (result.contacts && result.contacts.length > 0) {
                    result.contacts.forEach(contact => {
                        const listItem = document.createElement('li');
                        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

                        // 연락처 정보
                        const contactInfo = document.createElement('span');
                        contactInfo.textContent = `${contact.name} - ${contact.phone}`;

                        // 삭제 버튼
                        const deleteButton = document.createElement('button');
                        deleteButton.classList.add('btn', 'btn-sm', 'btn-danger', 'delete-contact-btn');
                        deleteButton.textContent = '삭제';
                        deleteButton.dataset.contactId = contact.id;

                        // 삭제 버튼 이벤트 핸들러
                        deleteButton.addEventListener('click', async () => {
                            if (confirm(`연락처 "${contact.name}"을(를) 삭제하시겠습니까?`)) {
                                try {
                                    const deleteResponse = await fetch(`/address_book/${addressBookId}/contacts/${contact.id}/delete`, {
                                        method: 'DELETE',
                                        credentials: 'include'
                                    });

                                    const deleteResult = await deleteResponse.json();

                                    if (deleteResponse.ok) {
                                        alert(deleteResult.message);
                                        loadAddressBookDetails(); // 목록 다시 불러오기
                                    } else {
                                        alert(`삭제 실패: ${deleteResult.error}`);
                                    }
                                } catch (error) {
                                    console.error('삭제 오류:', error);
                                    alert('연락처 삭제 중 오류가 발생했습니다.');
                                }
                            }
                        });

                        // 리스트 아이템에 추가
                        listItem.appendChild(contactInfo);
                        listItem.appendChild(deleteButton);
                        contactList.appendChild(listItem);
                    });
                } else {
                    contactList.innerHTML = '<li class="list-group-item">연락처가 없습니다.</li>';
                }
            } else {
                alert(`주소록 상세 조회 실패: ${result.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('주소록 상세 조회 중 오류가 발생했습니다.');
        }
    }

    // 연락처 추가 이벤트 핸들러
    addContactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('contactName').value.trim();
        const phone = document.getElementById('contactPhone').value.trim();
        const note = document.getElementById('contactNote').value.trim();

        if (!name || !phone) {
            alert('이름과 전화번호를 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(`/address_book/${addressBookId}/contacts/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ name, phone, note }),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                addContactForm.reset();
                loadAddressBookDetails(); // 목록 다시 불러오기
            } else {
                alert(`연락처 추가 실패: ${result.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('연락처 추가 중 오류가 발생했습니다.');
        }
    });

    // 초기 로드
    loadAddressBookDetails();
});
