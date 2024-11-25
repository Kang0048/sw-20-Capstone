// frontend/script/signup.js

document.addEventListener('DOMContentLoaded', function () {
  const signupForm = document.getElementById('signup-form');
  signupForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const username = document.getElementById('input-username').value.trim();
      const email = document.getElementById('input-email').value.trim();
      const password = document.getElementById('input-password').value;
      const passwordConfirm = document.getElementById('input-password-confirm').value;

      // 비밀번호 일치 확인
      if (password !== passwordConfirm) {
          alert('비밀번호가 일치하지 않습니다.');
          return;
      }

      // 이메일 유효성 검사 (기본적인 형태만 확인)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
          alert('유효한 이메일 주소를 입력해주세요.');
          return;
      }

      const data = {
          username: username,
          email: email,
          password: password,
      };

      try {
          const response = await fetch('/auth/register', { // 엔드포인트 수정
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
              credentials: 'include' // 세션 유지
          });

          const result = await response.json();

          if (response.ok) {
              alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
              window.location.href = 'login.html';
          } else {
              alert(`회원가입 실패: ${result.error}`);
          }
      } catch (error) {
          console.error('Error:', error);
          alert('회원가입 중 오류가 발생했습니다.');
      }
  });
});
