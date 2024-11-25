// frontend/script/messagePreview.js

document.addEventListener('DOMContentLoaded', function () {
    const messageForm = document.getElementById('message-form');

    messageForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const content = document.getElementById('message-content').value.trim();
        const imageInput = document.getElementById('image-upload');
        const imageFile = imageInput.files[0];

        if (!content) {
            alert('메시지 내용을 입력해주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('content', content);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = await fetch('/message/send', { // 백엔드의 /message/send 엔드포인트
                method: 'POST',
                body: formData,
                credentials: 'include' // 세션 쿠키 포함
            });

            const result = await response.json();

            if (response.ok) {
                alert('메시지가 성공적으로 발송되었습니다.');

                // 메시지 미리보기 업데이트
                const messagePreview = document.querySelector('.message-preview');
                messagePreview.innerHTML = result.message; // 서버에서 반환한 메시지 내용을 표시

                // 이미지 미리보기 업데이트
                if (result.imageUrl) {
                    const imagePreview = document.querySelector('.image-preview .image-box');
                    imagePreview.style.backgroundImage = `url(${result.imageUrl})`;
                    imagePreview.style.backgroundSize = 'contain';
                    imagePreview.style.backgroundRepeat = 'no-repeat';
                    imagePreview.style.backgroundPosition = 'center';

                    const placeholderText = imagePreview.querySelector('span');
                    if (placeholderText) placeholderText.style.display = 'none';
                } else {
                    const imagePreview = document.querySelector('.image-preview .image-box');
                    imagePreview.style.backgroundImage = '';
                    const placeholderText = imagePreview.querySelector('span');
                    if (placeholderText) placeholderText.style.display = 'block';
                }

                // 폼 초기화
                messageForm.reset();
            } else {
                alert(`메시지 발송 실패: ${result.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('메시지 발송 중 오류가 발생했습니다.');
        }
    });
});
