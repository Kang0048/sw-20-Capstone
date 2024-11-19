// generatePrompt.js
async function generatePrompt() {
    const userInput = document.getElementById('messageTitle').value;
    const location = document.getElementById('regionDropdown').value;

    const response = await fetch('http://127.0.0.1:5000/generate-APIprompt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userInput: userInput, location: location }) // 위치정보 가져오기
    });

    const data = await response.json();

    if(data.prompt)
        document.getElementById(`messageContent`).innerHTML = `${data.prompt}`;
    else
        document.getElementById(`messageContent`).innerHTML = "출력 오류";
    
}
