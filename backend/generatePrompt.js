function msgshowLoading() {
    const msgloadingOverlay = document.getElementById('msgloadingOverlay');
    msgloadingOverlay.style.display = 'flex';
  }
  
  function msghideLoading() {
    const msgloadingOverlay = document.getElementById('msgloadingOverlay');
    msgloadingOverlay.style.display = 'none';
  }
// generatePrompt.js
async function generatePrompt() {
    msgshowLoading();
    const userInput = document.getElementById('messageTitle').value;
    const location = document.getElementById('regionDropdown').value;
    const keyword = document.getElementById('keyword').value;
    const messageContent = document.getElementById('messageContent');
    const messageContent1 = document.getElementById('messageContent1');

    const response = await fetch('http://127.0.0.1:5000/generate-APIprompt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userInput: userInput, location: location, keyword: keyword }) // 위치정보 가져오기
    });

    const data = await response.json();

    // messageContent 처리
    if (data.prompt) {
        // 기존 내용 초기화
        const preInput = messageContent1.innerText;
        messageContent.innerHTML = '';
        messageContent1.innerHTML = '';

        // <pre> 태그를 추가하여 prompt 표시
        const preElement = document.createElement('pre');
        preElement.textContent = data.prompt + "\n" + preInput;
    
        // <pre>에 스타일 추가 (가로 스크롤 방지, 줄바꿈 처리)
        preElement.style.whiteSpace = 'pre-wrap';  // 줄 바꿈을 적용
        
        messageContent.innerText="";
        messageContent.appendChild(preElement);
        
        let existingPre = messageContent.querySelector('pre');
        // 이미 <pre>가 있으면 교체, 없으면 추가
        if (existingPre) {
            existingPre.replaceWith(preElement);
        } else {
            messageContent1.appendChild(preElement);
        }
    } else {
        // 오류 처리
        messageContent.innerHTML = '<p>출력 오류</p>';
        messageContent1.innerHTML = '<p>출력 오류</p>';
    }
    msghideLoading();
}
