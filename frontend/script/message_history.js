// 서버에서 메시지 데이터를 가져와 렌더링하는 함수
function fetchMessages() {
    // 서버로부터 데이터를 가져오는 AJAX 요청 (예제 URL로 변경 필요)
    fetch('/api/messages') // 데이터베이스에서 메시지 데이터를 가져올 API 엔드포인트
        .then(response => response.json())
        .then(data => {
            renderMessages(data);
        })
        .catch(error => console.error('Error fetching messages:', error));
}

// 메시지를 HTML에 렌더링하는 함수
function renderMessages(messages) {
    const messageList = document.getElementById('messageList');
    messageList.innerHTML = ''; // 기존 내용을 초기화

    messages.forEach(message => {
        const messageItem = document.createElement('div');
        messageItem.classList.add('item');

        messageItem.innerHTML = `
            <div class="id">${message.id}</div>
            <div class="title"><a href="#">${message.title}</a></div>
            <div class="sender">${message.sender}</div>
            <div class="date">${message.date}</div>
            <div class="recipients">${message.recipients}</div>
            <div class="status">${message.status}</div>
        `;

        messageList.appendChild(messageItem);
    });
}

// 페이지 로드 시 메시지 데이터를 가져옵니다.
document.addEventListener('DOMContentLoaded', fetchMessages);

// 검색 기능 추가
function searchMessages() {
    const query = document.getElementById('searchInput').value;
    fetch(`/api/messages?search=${query}`) // 검색어를 포함한 API 호출
        .then(response => response.json())
        .then(data => {
            renderMessages(data);
        })
        .catch(error => console.error('Error searching messages:', error));
}