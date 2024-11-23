import { requestSend } from '/ppurio/ppurio.js';

document.addEventListener('DOMContentLoaded', () => {
    const ppurioData = {
        from: '',
        name: '',
        to: [],
        content: '',
        image: ''
    };

    // 발신번호와 이름 처리
    const phoneNumberInput = document.getElementById('phoneNumberInput');
    const ownerInput = document.getElementById('ownerInput');

    if (phoneNumberInput && ownerInput) {
        phoneNumberInput.addEventListener('input', () => {
            ppurioData.from = phoneNumberInput.value.trim();
        });

        ownerInput.addEventListener('input', () => {
            ppurioData.name = ownerInput.value.trim();
        });
    }

    // 수신번호 리스트 처리
    const recipientList = document.getElementById('recipientlist');
    const phoneInput = document.getElementById('phoneInput'); // 수신번호 입력 필드
    const addPhoneButton = document.getElementById('addPhoneButton');

    if (phoneInput && addPhoneButton && recipientList) {
        addPhoneButton.addEventListener('click', () => {
            const number = phoneInput.value.trim();
            if (number) {
                ppurioData.to.push(number); // 수신번호 추가
                phoneInput.value = ''; // 입력 필드 초기화

                // UI에 추가된 수신번호 표시
                const numberElement = document.createElement('div');
                numberElement.textContent = number;
                recipientList.appendChild(numberElement);
            }
        });
    }

    // 문자 내용 처리
    const messageContent = document.getElementById('messageContent');
    if (messageContent) {
        messageContent.addEventListener('input', () => {
            ppurioData.content = messageContent.value.trim();
        });
    }

    // 이미지 경로 처리
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    ppurioData.image = e.target.result; // Base64 데이터로 설정
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 전송 버튼 클릭 시 실행
    window.sendMessage = async () => {
        console.log('sendMessage 함수 호출됨');
        console.log('ppurioData:', ppurioData);

        if (!ppurioData.from || !ppurioData.to.length || !ppurioData.content) {
            alert('발신번호, 수신번호, 또는 문자 내용을 입력하세요.');
            return;
        }

        try {
            const result = await requestSend(
                ppurioData.to,
                ppurioData.from,
                ppurioData.name,
                ppurioData.content,
                ppurioData.image
            );
            console.log('전송 성공:', result);
            alert('메시지가 성공적으로 전송되었습니다.');
        } catch (error) {
            console.error('전송 실패:', error);
            alert('메시지 전송에 실패했습니다.');
        }
    };
});
