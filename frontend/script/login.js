// script/login.js

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('input-username').value;
    const password = document.getElementById('input-password').value;

    // 데이터 확인을 위한 로그 추가
    console.log('Username:', username);
    console.log('Password:', password);

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
      });

      const result = await response.json();

      if (response.ok) {
        alert('로그인 성공');
        // 토큰 저장 (필요한 경우)
        localStorage.setItem('token', result.token);
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
