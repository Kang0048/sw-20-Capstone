// generateImages.js
async function generateUserImages() {
  const userInput = document.getElementById('messageContent1').value;
  const userItem = document.getElementById('userItem').value;
  const userSeason = document.getElementById('userSeason').value;
  const userWeather = document.getElementById('userWeather').value;
  const userSex = document.querySelector('input[name="gender"]:checked')?.value;

  //if (!userItem || !userSeason || !userWeather || !userInput) {alert('please fill out all fields')}
  const response = await fetch('http://127.0.0.1:5000/generate-userImage', {
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

  // keywordURL을 올바르게 표시
  if (data.keywordURL) {
    document.getElementById('url').innerHTML = data.keywordURL;
  } else {
    document.getElementById('url').innerHTML = 'No URL';
  }
}
