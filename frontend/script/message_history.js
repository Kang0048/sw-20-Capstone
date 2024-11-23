// script/message_history.js

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
  
    if (!token) {
      alert('로그인이 필요합니다.');
      window.location.href = 'login.html';
      return;
    }
  
    try {
      const response = await fetch('/message', {
        headers: {
          'Authorization': token,
        },
      });
  
      const result = await response.json();
  
      if (response.ok) {
        const messageList = document.getElementById('messageList');
        messageList.innerHTML = ''; // 기존 내용을 지웁니다.
  
        result.messages.forEach(message => {
          const itemDiv = document.createElement('div');
          itemDiv.classList.add('item');
  
          // ID
          const idDiv = document.createElement('div');
          idDiv.classList.add('id');
          idDiv.textContent = message.id;
  
          // Title (메시지 내용의 앞부분 사용)
          const titleDiv = document.createElement('div');
          titleDiv.classList.add('title');
          const titleLink = document.createElement('a');
          titleLink.href = '#';
          titleLink.textContent = message.content.length > 10 ? message.content.substring(0, 10) + '...' : message.content;
          titleDiv.appendChild(titleLink);
  
          // Sender (로그인한 사용자로 표시)
          const senderDiv = document.createElement('div');
          senderDiv.classList.add('sender');
          senderDiv.textContent = '나';
  
          // Date
          const dateDiv = document.createElement('div');
          dateDiv.classList.add('date');
          const date = new Date(message.created_at);
          dateDiv.textContent = date.toLocaleDateString('ko-KR');
  
          // Recipients (임시로 1로 설정)
          const recipientsDiv = document.createElement('div');
          recipientsDiv.classList.add('recipients');
          recipientsDiv.textContent = '1';
  
          // 각 요소를 itemDiv에 추가
          itemDiv.appendChild(idDiv);
          itemDiv.appendChild(titleDiv);
          itemDiv.appendChild(senderDiv);
          itemDiv.appendChild(dateDiv);
          itemDiv.appendChild(recipientsDiv);
  
          // itemDiv를 messageList에 추가
          messageList.appendChild(itemDiv);
        });
      } else {
        alert(`메시지 내역 조회 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('메시지 내역 조회 중 오류가 발생했습니다.');
    }
  });
  