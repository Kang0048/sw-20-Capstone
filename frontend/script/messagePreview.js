// frontend/script/messagePreview.js

// 발송하기 버튼을 눌렀을 때 함수
function updatePreviewContent() {
    // 제목 업데이트
    document.querySelector(".display-title").textContent = document.getElementById("title").value;

    // messageContent1의 현재 상태 가져오기
    const messageContent1 = document.getElementById("messageContent1");
    const displayMessage = document.querySelector(".display-message");

    // display-message 초기화
    displayMessage.innerHTML = '';

    // messageContent1의 모든 자식 노드 복사
    messageContent1.childNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            // <a>나 <pre> 태그 등 모든 요소를 복사해서 추가
            displayMessage.appendChild(node.cloneNode(true));
        } else if (node.nodeType === Node.TEXT_NODE) {
            // 텍스트 노드만 추가
            displayMessage.appendChild(document.createTextNode(node.textContent));
        }
    });

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
        const messageContent = document.getElementById("messageContent");
        const messageContent1 = document.getElementById("messageContent1");

        // messageContent에서 모든 <pre> 태그 제거
        const preTags = messageContent.querySelectorAll('pre');
        preTags.forEach(pre => pre.remove());  // <pre> 태그 제거

        // messageContent에서 <pre> 태그가 제거된 HTML 내용 가져오기
        const generatedContent = messageContent.innerHTML;

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