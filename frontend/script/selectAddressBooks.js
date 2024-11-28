// frontend/script/selectAddressBooks.js

document.addEventListener('DOMContentLoaded', () => {
    const addressBookListInModal = document.getElementById('addressBookListInModal');
    const addressModalElement = document.getElementById('addressModal'); // 'addressModal' 유지
    const recipientList = document.getElementById('recipientList'); // 수신번호 목록 컨테이너
    const placeholderText = document.getElementById('placeholderText');
    const totalCountElement = document.getElementById('totalCount');

    if (addressModalElement && addressBookListInModal && recipientList && placeholderText && totalCountElement) {
        console.log('주소록 선택 및 수신번호 추가 기능 활성화');

        const addressModal = new bootstrap.Modal(addressModalElement);

        // 주소록 목록 로드 함수
        async function loadAddressBooksInModal() {
            try {
                console.log('주소록 목록을 모달에 불러옵니다.');
                const response = await fetch('/address_book/list', {
                    method: 'GET',
                    credentials: 'include', // 세션 쿠키 포함
                });

                const result = await response.json();
                console.log('모달 주소록 목록 응답:', result);

                if (response.ok) {
                    addressBookListInModal.innerHTML = ''; // 모달 내 목록 초기화

                    if (result.addressBooks && result.addressBooks.length > 0) {
                        for (const addressBook of result.addressBooks) {
                            // 모달 내에 표시될 주소록 목록 항목
                            const modalListItem = document.createElement('div');
                            modalListItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

                            const modalName = document.createElement('span');
                            modalName.textContent = addressBook.name;

                            const selectButton = document.createElement('button');
                            selectButton.classList.add('btn', 'btn-sm', 'btn-primary');
                            selectButton.textContent = '선택';
                            selectButton.addEventListener('click', () => {
                                selectAddressBook(addressBook.id, addressBook.name);
                                addressModal.hide(); // 모달 닫기
                            });

                            modalListItem.appendChild(modalName);
                            modalListItem.appendChild(selectButton);
                            addressBookListInModal.appendChild(modalListItem);
                        }
                    } else {
                        addressBookListInModal.innerHTML = '<div class="alert alert-info">생성된 주소록이 없습니다.</div>';
                    }
                } else {
                    alert(`주소록 목록 조회 실패: ${result.error}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert(`주소록 목록 조회 중 오류가 발생했습니다: ${error.message}`);
            }
        }

        // 주소록 선택 시 연락처 추가 함수
        async function selectAddressBook(addressBookId, addressBookName) {
            try {
                console.log(`선택한 주소록 ID: ${addressBookId}, 이름: ${addressBookName}`);
                // 특정 주소록의 연락처 조회
                const response = await fetch(`/address_book/${addressBookId}/contacts`, {
                    method: 'GET',
                    credentials: 'include',
                });

                const result = await response.json();
                console.log(`선택한 주소록(${addressBookName})의 연락처 목록:`, result);

                if (response.ok) {
                    if (result.contacts && result.contacts.length > 0) {
                        // 수신번호 목록에 연락처 추가
                        for (const contact of result.contacts) {
                            addRecipient(contact.phone);
                        }
                        alert(`"${addressBookName}" 주소록의 연락처가 수신번호 목록에 추가되었습니다.`);
                    } else {
                        alert(`"${addressBookName}" 주소록에 연락처가 없습니다.`);
                    }
                } else {
                    alert(`연락처 조회 실패: ${result.error}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert(`연락처 조회 중 오류가 발생했습니다: ${error.message}`);
            }
        }

        // 수신번호 추가 함수 (중복 방지)
        function addRecipient(phoneNumber) {
            const existingRecipients = recipientList.querySelectorAll('.recipient-item');
            for (const recipient of existingRecipients) {
                if (recipient.querySelector('.phone-number').textContent.trim() === phoneNumber) {
                    alert(`이미 "${phoneNumber}" 번호가 추가되어 있습니다.`);
                    return;
                }
            }

            // 새로운 수신번호 항목 생성
            const recipientItem = document.createElement('div');
            recipientItem.classList.add('recipient-item', 'd-flex', 'align-items-center', 'mb-2');

            const phoneSpan = document.createElement('span');
            phoneSpan.textContent = phoneNumber;
            phoneSpan.classList.add('me-2', 'phone-number');

            const removeButton = document.createElement('button');
            removeButton.classList.add('btn', 'btn-sm', 'btn-danger');
            removeButton.textContent = '삭제';
            removeButton.addEventListener('click', () => {
                recipientList.removeChild(recipientItem);
                updateTotalCount();
                if (recipientList.children.length === 0) {
                    placeholderText.style.display = 'block';
                }
            });

            recipientItem.appendChild(phoneSpan);
            recipientItem.appendChild(removeButton);
            recipientList.appendChild(recipientItem);

            // 자리 표시 텍스트 숨기기
            placeholderText.style.display = 'none';

            updateTotalCount();
        }

        // 총 인원 업데이트 함수
        function updateTotalCount() {
            const totalCount = recipientList.querySelectorAll('.recipient-item').length;
            totalCountElement.textContent = `전체 ${totalCount}명`;
        }

        // 모달 열릴 때 주소록 목록 로드
        addressModalElement.addEventListener('shown.bs.modal', loadAddressBooksInModal);
    }
});
