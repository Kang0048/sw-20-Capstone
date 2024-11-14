// messagePreview.js

// 발송하기 버튼을 눌렀을 때 함수
function updatePreviewContent() {
    document.querySelector(".display-title").textContent = document.getElementById("title").value;
    document.querySelector(".display-message").textContent = document.getElementById("messageContent1").value;

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

// message 확정 함수
function confirmMessage() {
    if (confirm("확정하시겠습니까?")) {
        const generatedContent = document.getElementById("messageContent").innerText;
        document.getElementById("messageContent1").value = generatedContent;

        const messageModal = document.getElementById("messageModal");
        const modal = bootstrap.Modal.getInstance(messageModal);
        modal.hide();
    }
}
