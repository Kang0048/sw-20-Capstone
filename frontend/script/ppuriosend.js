import { requestSend } from '/ppurio/ppurio.js';

document.addEventListener('DOMContentLoaded', () => {
    // 메시지 전송 함수 정의
    window.sendMessage = async () => {
        console.log('sendMessage 함수 호출됨');
    
        // HTML 입력 필드에서 값을 가져와 ppurioData 생성
        const ppurioData = {
            from: document.getElementById('phoneNumberInput')?.value.trim() || '', // 발신번호
            name: document.getElementById('ownerInput')?.value.trim() || '', // 발신자 이름
            to: Array.from(document.getElementById('recipientList')?.children || [])
                .filter((child) => child.id !== 'placeholderText') // 플레이스홀더 제외
                .map((child) => child.textContent.trim())
                .filter((num) => num), // 비어있는 값 필터링
            content: document.getElementById('messageContent1')?.innerText.trim() || '', // 메시지 내용 수정
            image: window.selectedImageUrl || '', // 선택된 이미지 URL (전역 변수)
        };
    
        // ppurioData 확인 로그
        console.log('ppurioData:', ppurioData);
    
        // 데이터 유효성 검사
        if (!ppurioData.from || !ppurioData.to.length || !ppurioData.content) {
            alert('발신번호, 수신번호, 또는 문자 내용을 입력하세요.');
            console.error('유효성 검사 실패:', {
                from: ppurioData.from,
                to: ppurioData.to,
                content: ppurioData.content,
            });
            return;
        }
    
        // 메시지 전송 요청
        try {
            const result = await requestSend(
                ppurioData.to, // 수신번호
                ppurioData.from, // 발신번호
                ppurioData.name, // 발신자 이름
                ppurioData.content, // 메시지 내용
                ppurioData.image // 이미지 URL
            );
            console.log('전송 성공:', result);
            alert('메시지가 성공적으로 전송되었습니다.');
            window.location.href = 'weather.html';
        } catch (error) {
            console.error('전송 실패:', error);
            alert('메시지 전송에 실패했습니다. 다시 시도해 주세요.');
        }
    };
});
