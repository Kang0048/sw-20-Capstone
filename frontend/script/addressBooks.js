// frontend/script/addressBooks.js

document.addEventListener('DOMContentLoaded', () => {
    const createForm = document.getElementById('createAddressBookForm');
    const addressBookList = document.getElementById('addressBookList');

    if (createForm && addressBookList) {
        console.log('주소록 생성 및 관리 기능 활성화');

        // 주소록 생성 이벤트 핸들러
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('addressBookName').value.trim();
            const region = document.getElementById('region').value.trim();
            const phoneInput = document.getElementById('phoneInput').value.trim();

            if (!name) {
                alert('주소록 이름을 입력해주세요.');
                return;
            }

            // 전화번호 파싱 (줄바꿈 기준)
            const phoneNumbers = phoneInput.split('\n').map(num => num.trim()).filter(num => num !== '');

            try {
                // 주소록 생성
                const createResponse = await fetch('/address_book/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // 세션 쿠키 포함
                    body: JSON.stringify({ name, region }),
                });

                const createResult = await createResponse.json();

                if (createResponse.ok) {
                    const addressBookId = createResult.addressBookId;

                    // 전화번호가 입력된 경우 연락처 추가
                    for (const phone of phoneNumbers) {
                        await fetch(`/address_book/${addressBookId}/contacts/add`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({ name: '연락처', phone, note: '' }), // 이름은 기본값으로 설정
                        });
                    }

                    alert(createResult.message);
                    // 폼 초기화
                    createForm.reset();
                    // 주소록 목록 다시 불러오기
                    loadAddressBooks();
                } else {
                    alert(`주소록 생성 실패: ${createResult.error}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert(`주소록 생성 중 오류가 발생했습니다: ${error.message}`);
            }
        });

        // 주소록 목록 로드 함수
        async function loadAddressBooks() {
            try {
                console.log('주소록 목록을 불러옵니다.');
                const response = await fetch('/address_book/list', {
                    method: 'GET',
                    credentials: 'include', // 세션 쿠키 포함
                });

                const result = await response.json();
                console.log('주소록 목록 응답:', result);

                if (response.ok) {
                    addressBookList.innerHTML = ''; // 기존 목록 초기화

                    if (result.addressBooks && result.addressBooks.length > 0) {
                        for (const addressBook of result.addressBooks) {
                            // 연락처 수 조회
                            let contactCount = 0;
                            try {
                                const contactsResponse = await fetch(`/address_book/${addressBook.id}/contacts`, {
                                    method: 'GET',
                                    credentials: 'include',
                                });
                                const contactsResult = await contactsResponse.json();
                                if (contactsResponse.ok) {
                                    contactCount = contactsResult.contacts.length;
                                }
                            } catch (err) {
                                console.error('연락처 수 조회 오류:', err);
                            }

                            const listItem = document.createElement('div');
                            listItem.classList.add('card', 'mb-3');

                            const cardBody = document.createElement('div');
                            cardBody.classList.add('card-body', 'd-flex', 'justify-content-between', 'align-items-center');

                            // 주소록 이름
                            const nameSpan = document.createElement('h5');
                            nameSpan.classList.add('card-title');
                            nameSpan.textContent = addressBook.name;

                            // 수신자 수 표시
                            const badge = document.createElement('span');
                            badge.classList.add('badge', 'bg-primary', 'rounded-pill');
                            badge.textContent = `${contactCount}명`;

                            // 열기 버튼
                            const openButton = document.createElement('a');
                            openButton.href = `address_book.html?addressBookId=${addressBook.id}`;
                            openButton.classList.add('btn', 'btn-sm', 'btn-secondary', 'me-2');
                            openButton.textContent = '열기';

                            // 삭제 버튼
                            const deleteButton = document.createElement('button');
                            deleteButton.classList.add('btn', 'btn-sm', 'btn-danger');
                            deleteButton.textContent = '삭제';
                            deleteButton.addEventListener('click', () => {
                                deleteAddressBook(addressBook.id, addressBook.name);
                            });

                            // 카드에 요소 추가
                            cardBody.appendChild(nameSpan);
                            cardBody.appendChild(badge);
                            cardBody.appendChild(openButton);
                            cardBody.appendChild(deleteButton);
                            listItem.appendChild(cardBody);
                            addressBookList.appendChild(listItem);
                        }
                    } else {
                        addressBookList.innerHTML = '<div class="alert alert-info">생성된 주소록이 없습니다.</div>';
                    }
                } else {
                    alert(`주소록 목록 조회 실패: ${result.error}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert(`주소록 목록 조회 중 오류가 발생했습니다: ${error.message}`);
            }
        }

        // 주소록 삭제 함수
        async function deleteAddressBook(addressBookId, addressBookName) {
            const confirmDelete = confirm(`정말로 "${addressBookName}" 주소록을 삭제하시겠습니까?`);

            if (!confirmDelete) return;

            try {
                const response = await fetch(`/address_book/${addressBookId}/delete`, {
                    method: 'DELETE',
                    credentials: 'include', // 세션 쿠키 포함
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message);
                    // 주소록 목록 다시 불러오기
                    loadAddressBooks();
                } else {
                    alert(`주소록 삭제 실패: ${result.error}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert(`주소록 삭제 중 오류가 발생했습니다: ${error.message}`);
            }
        }

        // 페이지 로드 시 주소록 목록 불러오기
        loadAddressBooks();
    }
});
