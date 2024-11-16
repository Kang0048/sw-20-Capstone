const { requestSend } = require('./ppurio/ppurio.js'); // 정확한 경로 사용

async function sendMessage() {
    // Extract data from the modal
    const title = document.querySelector(".display-title").innerText.trim();
    const content = document.querySelector(".display-message").innerText.trim();
    const to = "01028889264"; // Replace with dynamic receiver input if needed
    const from = "01028889264"; // Replace with sender input if needed
    const filePath = "./image.jpg"; // Replace with dynamic file path if needed

    if (!content) {
        alert("문자 내용을 입력해주세요.");
        return;
    }

    try {
        // Send data to backend
        const response = await fetch('/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, to, from, content, filePath })
        });

        const result = await response.json();
        alert(result.message || "메시지가 성공적으로 전송되었습니다.");
    } catch (error) {
        console.error("오류 발생:", error);
        alert("메시지 전송 실패!");
    }
}