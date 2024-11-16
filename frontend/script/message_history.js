

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