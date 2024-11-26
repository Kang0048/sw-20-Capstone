// frontend/script/menuActivation.js

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/auth/status', {
            method: 'GET',
            credentials: 'include' // 세션 쿠키 포함
        });

        const result = await response.json();
        const loginButton = document.getElementById('loginButton');

        // 기존 이벤트 리스너 제거
        loginButton.replaceWith(loginButton.cloneNode(true));
        const newLoginButton = document.getElementById('loginButton');

        if (result.loggedIn) {
            // 로그인 상태인 경우
            newLoginButton.textContent = 'Logout';
            newLoginButton.addEventListener('click', async () => {
                try {
                    const logoutResponse = await fetch('/auth/logout', {
                        method: 'POST',
                        credentials: 'include'
                    });
                    const logoutResult = await logoutResponse.json();
                    if (logoutResponse.ok) {
                        alert('로그아웃 되었습니다.');
                        window.location.href = 'login.html';
                    } else {
                        alert(`로그아웃 실패: ${logoutResult.error}`);
                    }
                } catch (error) {
                    console.error('로그아웃 오류:', error);
                    alert('로그아웃 중 오류가 발생했습니다.');
                }
            });
        } else {
            // 로그인 상태가 아닌 경우
            newLoginButton.textContent = 'Login';
            newLoginButton.addEventListener('click', () => {
                window.location.href = 'login.html';
            });

            // 현재 페이지가 로그인이나 회원가입 페이지가 아닌 경우 로그인 페이지로 리디렉션
            const currentPage = window.location.pathname.split('/').pop();
            if (!['login.html', 'signup.html'].includes(currentPage)) {
                window.location.href = 'login.html';
            }
        }
    } catch (error) {
        console.error('로그인 상태 확인 오류:', error);
        alert('로그인 상태를 확인하는 중 오류가 발생했습니다.');
    }
});
