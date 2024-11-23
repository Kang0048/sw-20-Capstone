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
    
    const response = await fetch('http://127.0.0.1:5000/generate-APIimage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userKeyword: userKeyword, userLoc: userLoc, userGender: userGender})
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
        // URL 추가
        messageContent1.value += `\nURL 링크 \n${data.keywordURL}`;<pre></pre>
    } else {
        // URL이 없을 경우 메시지 추가
        messageContent1.value += `No URL generated`;
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