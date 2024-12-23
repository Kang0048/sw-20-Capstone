// generateImages.js
function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = 'flex';
  }
  
  function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = 'none';
  }
async function generateImages() {
    showLoading();
    const userKeyword = document.getElementById('userKeyword').value;
    const userLoc = document.getElementById('region').value;
    const userGender = checkGender('male', 'female');
    const userInputFix = document.getElementById('InputFix').value;
    const urlContent = document.getElementById('urlContent');

    const response = await fetch('/generate-APIimage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userKeyword: userKeyword, userLoc: userLoc, userGender: userGender, userInputFix: userInputFix })
    });

    const data = await response.json();

    // 각 이미지 컨테이너를 초기화
    for (let i = 1; i <= 4; i++) {
        const container = document.getElementById(`imageBox${i}`);
        container.innerHTML = '';
    }

    // 이미지가 있는 경우 각 컨테이너에 하나씩 추가
    if (data.images && data.images.length > 0) {
        data.images.forEach((imageUrl, index) => {
            if (index < 4) { // 최대 4개까지만 추가
                const imgElement = document.createElement(`img`);
                imgElement.src = imageUrl;
                document.getElementById(`imageBox${index + 1}`).appendChild(imgElement);
            }
        });
    } else {
        // 이미지가 없을 경우 메시지 출력
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`imageBox${i}`).innerHTML = '<p>No image</p>';
        }
    }

    // keywordURL을 올바르게 표시
    if (data.keywordURL) {
        if (urlContent) {
            // URL 추가: href와 텍스트 값 설정
            urlContent.href = data.keywordURL;
            urlContent.textContent = data.keywordURL;
        } else {
            console.error("urlContent element is missing in the DOM.");
        }

        if (messageContent1) {
            const linkElement = messageContent1.querySelector('a');
            if (linkElement) {
                linkElement.href = data.keywordURL;
                linkElement.textContent = data.keywordURL;
            } else {
                const newLink = document.createElement('a');
                newLink.href = data.keywordURL;
                newLink.textContent = data.keywordURL;
                messageContent1.appendChild(newLink);
            }
        } else {
            console.error("messageContent1 element is missing in the DOM.");
        }
    } else {
        // URL이 없을 경우 초기화
        if (urlContent) {
            urlContent.href = '';
            urlContent.textContent = 'No URL available12';
        }
        if (messageContent1) {
            const linkElement = messageContent1.querySelector('a');
            if (linkElement) {
                linkElement.href = '';
                linkElement.textContent = 'No URL available34';
            }
        }
    }

    hideLoading(); 
}

function checkGender(maleID, femaleID){
    const maleRadio = document.getElementById(maleID);
    const femaleRadio = document.getElementById(femaleID);
    
    var gender;

    if (maleRadio.checked) {
        gender = maleRadio.value; // 'male'이 선택된 경우
    } else if (femaleRadio.checked) {
        gender = femaleRadio.value; // 'female'이 선택된 경우
    } else{
        gender = 'male';
    }

    return gender;
    
}