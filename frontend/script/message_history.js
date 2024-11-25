// frontend/script/message_history.js

document.addEventListener('DOMContentLoaded', async () => {
  try {
      const response = await fetch('/message/history', {
          method: 'GET',
          credentials: 'include' // 세션 쿠키 포함
      });

      const result = await response.json();

      if (response.ok) {
          const messageList = document.getElementById('messageList');
          messageList.innerHTML = ''; // 기존 내용을 지웁니다.

          if (result.messages && result.messages.length > 0) {
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
                  titleLink.href = '#'; // 실제 발송 내역 페이지로 변경 필요
                  titleLink.textContent = message.content.length > 10 ? message.content.substring(0, 10) + '...' : message.content;
                  titleDiv.appendChild(titleLink);

                  // Sender (로그인한 사용자로 표시)
                  const senderDiv = document.createElement('div');
                  senderDiv.classList.add('sender');
                  senderDiv.textContent = '나'; // 로그인한 사용자 이름으로 변경 가능

                  // Date
                  const dateDiv = document.createElement('div');
                  dateDiv.classList.add('date');
                  const date = new Date(message.created_at);
                  dateDiv.textContent = date.toLocaleDateString('ko-KR');

                  // Recipients (실제 수신자 수로 변경)
                  const recipientsDiv = document.createElement('div');
                  recipientsDiv.classList.add('recipients');
                  recipientsDiv.textContent = message.recipients_count || '0'; // 서버에서 수신자 수 제공 시 사용

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
              messageList.innerHTML = '<div class="text-center">보낸 메시지가 없습니다.</div>';
          }
      } else {
          alert(`메시지 내역 조회 실패: ${result.error}`);
      }
  } catch (error) {
      console.error('Error:', error);
      alert('메시지 내역 조회 중 오류가 발생했습니다.');
  }
});
