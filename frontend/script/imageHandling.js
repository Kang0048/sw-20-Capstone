// imageHandling.js

// imageUploadContainer 클릭 시 파일 입력 활성화
document.getElementById("imageUploadContainer").addEventListener("click", function () {
    document.getElementById("imageInput").click();
});

let selectedImageBoxId = null;

// 이미지 선택 함수
function selectImage(element) {
    if (selectedImageBoxId) {
        document.getElementById(selectedImageBoxId).classList.remove('selected');
    }

    selectedImageBoxId = element.id;
    element.classList.add('selected');
}

function confirmSelection() {
    if (selectedImageBoxId) {
        const selectedImageUrl = document.getElementById(selectedImageBoxId).querySelector('img').src;

        if (confirm("확정하시겠습니까?")) {
            const modalElement = document.getElementById('imageModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();

            const imageContainer = document.getElementById("imageUploadContainer");
            imageContainer.innerHTML = `<img src="${selectedImageUrl}" class="img-fluid" style="max-width: 100%; max-height: 100%;">`;

            imageContainer.style.width = '250px';
            imageContainer.style.height = '250px';
            imageContainer.style.padding = '0';
        }
    } else {
        alert("이미지를 선택해주세요.");
    }
}

// 이미지 파일 선택 시 미리보기 업데이트 함수
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imageContainer = document.getElementById("imageUploadContainer");
            imageContainer.innerHTML = `<img src="${e.target.result}" class="img-fluid">`;
        };
        reader.readAsDataURL(file);
    }
}



