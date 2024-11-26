// frontend/script/messagePreview.js

// 발송하기 버튼을 눌렀을 때 함수
function updatePreviewContent() {
    // 제목 업데이트
    document.querySelector(".display-title").textContent = document.getElementById("title").value;
    
    // messageContent1에서 <pre> 태그와 <a> 태그 가져오기
    const preElement = document.querySelector("#messageContent1 pre");
    const linkElement = document.querySelector("#messageContent1 a");
     // display-message에 원본 형식 그대로 추가
     const displayMessage = document.querySelector(".display-message");
     displayMessage.innerHTML = ''; // 기존 내용 초기화
      // <pre> 태그가 있으면 그 내용을 그대로 추가
    if (preElement) {
        displayMessage.innerHTML += preElement.outerHTML; // <pre> 태그 원본 그대로 추가
    }
    // <a> 태그가 있으면 그 내용을 그대로 추가
    if (linkElement) {
        displayMessage.innerHTML += linkElement.outerHTML; // <a> 태그 원본 그대로 추가
    }


    
    // 이미지 미리보기 처리
    const imageContainer = document.getElementById("imageUploadContainer");
    const previewContainer = document.querySelector(".image-preview");
    const imgElement = imageContainer.querySelector("img");
    if (imgElement) {
        previewContainer.style.backgroundImage = `url(${imgElement.src})`;
        previewContainer.style.backgroundSize = "contain";
        previewContainer.style.backgroundRepeat = "no-repeat";
        previewContainer.style.backgroundPosition = "center";
        const placeholderText = previewContainer.querySelector("span");
        if (placeholderText) placeholderText.style.display = "none";
    } else {
        previewContainer.style.backgroundImage = "";
        previewContainer.querySelector("span").style.display = "block";
    }
}
function confirmMessage() {
    if (confirm("확정하시겠습니까?")) {
        // messageContent의 HTML을 그대로 가져오기
        const generatedContent = document.getElementById("messageContent").innerHTML;
        const messageContent1 = document.getElementById("messageContent1");
         // a 태그가 있는지 확인
         const existingLink = messageContent1.querySelector('a');
         if (existingLink) {
            // a 태그 앞에 내용을 삽입
            messageContent1.insertBefore(
                new DOMParser().parseFromString(generatedContent, 'text/html').body.firstChild,
                existingLink
            );
        } else {
            // a 태그가 없으면 내용만 추가
            messageContent1.innerHTML += generatedContent;
        }
        // Modal 닫기
        const messageModal = document.getElementById("messageModal");
        const modal = bootstrap.Modal.getInstance(messageModal);
        modal.hide();
    }
}
