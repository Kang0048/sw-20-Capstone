function showLoading() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  loadingOverlay.style.display = 'flex';
}

function hideLoading() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  loadingOverlay.style.display = 'none';
}
// generateImages.js
async function generateUserImages() {
  showLoading();
  const userInput = document.getElementById('messageContent1').textContent;
  const userItem = document.getElementById('userItem').value;
  const userSeason = document.getElementById('userSeason').value;
  const userWeather = document.getElementById('userWeather').value;
  const userSex = document.querySelector('input[name="gender"]:checked')?.value;
  const userInputFix = document.getElementById('userInputFix').value;
  const urlContent = document.getElementById('urlContent');

  //if (!userItem || !userSeason || !userWeather || !userInput) {alert('please fill out all fields')}
  const response = await fetch('/generate-userImage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userItem: userItem,
      userSeason: userSeason,
      userWeather: userWeather,
      userInput: userInput,
      userSex: userSex,
      userInputFix: userInputFix,
    }),
  });

  const data = await response.json();

  // 각 이미지 컨테이너를 초기화
  for (let i = 1; i <= 4; i++) {
    const container = document.getElementById(`userImageBox${i}`);
    container.innerHTML = '';
  }

  // 이미지가 있는 경우 각 컨테이너에 하나씩 추가
  if (data.images && data.images.length > 0) {
    data.images.forEach((imageUrl, index) => {
      if (index < 4) {
        // 최대 4개까지만 추가
        const imgElement = document.createElement(`img`);
        imgElement.src = imageUrl;
        document
          .getElementById(`userImageBox${index + 1}`)
          .appendChild(imgElement);
      }
    });
  } else {
    // 이미지가 없을 경우 메시지 출력
    for (let i = 1; i <= 4; i++) {
      document.getElementById(`userImageBox${i}`).innerHTML = '<p>No image</p>';
    }
  }
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
        urlContent.textContent = 'No URL available';
    }
    if (messageContent1) {
        const linkElement = messageContent1.querySelector('a');
        if (linkElement) {
            linkElement.href = '';
            linkElement.textContent = 'No URL available';
        }
    }
}
  hideLoading();
  
}
