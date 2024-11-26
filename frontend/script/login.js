// frontend/script/login.js

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const username = document.getElementById('input-username').value.trim();
      const password = document.getElementById('input-password').value;

      const data = {
          username: username,
          password: password,
      };

      try {
          const response = await fetch('/auth/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
              credentials: 'include' // 세션 쿠키 포함
          });

          const result = await response.json();

          if (response.ok) {
              alert('로그인 성공');
              // 로그인 성공 후 이동할 페이지로 리디렉션
              window.location.href = 'message_history.html';
          } else {
              alert(`로그인 실패: ${result.error}`);
          }
      } catch (error) {
          console.error('Error:', error);
          alert('로그인 중 오류가 발생했습니다.');
      }
  });
});
