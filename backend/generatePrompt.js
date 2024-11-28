function msgshowLoading() {
    const msgloadingOverlay = document.getElementById('msgloadingOverlay');
    msgloadingOverlay.style.display = 'flex';
}

function msghideLoading() {
    const msgloadingOverlay = document.getElementById('msgloadingOverlay');
    msgloadingOverlay.style.display = 'none';
}

async function generatePrompt() {
    msgshowLoading();
    const userInput = document.getElementById('messageTitle').value;
    const location = document.getElementById('regionDropdown').value;
    const keyword = document.getElementById('keyword').value;
    const messageContent = document.getElementById('messageContent');
    const messageContent1 = document.getElementById('messageContent1');

    try {
        const response = await fetch('http://127.0.0.1:5000/generate-APIprompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userInput: userInput, location: location, keyword: keyword })
        });

        const data = await response.json();

        if (data.prompt) {
            // messageContent 초기화
            messageContent.innerHTML = '';

            // <pre> 태그 생성 및 데이터 추가
            const preElement = document.createElement('pre');
            preElement.textContent = data.prompt;
            preElement.style.whiteSpace = 'pre-wrap'; // 줄 바꿈 적용

            // <pre> 태그를 messageContent에 추가
            messageContent.appendChild(preElement);

            // messageContent1에 messageContent의 첫 번째 <pre> 태그를 추가
            messageContent1.innerHTML = ''; // 초기화
            messageContent1.appendChild(preElement.cloneNode(true)); // <pre> 태그 복제하여 추가
        } else {
            // 오류 처리
            messageContent.innerHTML = '<p>출력 오류</p>';
            messageContent1.innerHTML = '<p>출력 오류</p>';
        }
    } catch (error) {
        console.error('Error during prompt generation:', error);
        messageContent.innerHTML = '<p>서버 오류</p>';
        messageContent1.innerHTML = '<p>서버 오류</p>';
    } finally {
        msghideLoading();
    }
}
