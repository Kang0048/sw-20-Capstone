// frontend/script/menuActivation.js

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/auth/status', {
            method: 'GET',
            credentials: 'include' // 세션 쿠키 포함
        });

        const result = await response.json();

        if (result.loggedIn) {
            // 로그인 상태인 경우
            document.getElementById('loginButton').textContent = 'Logout';
            document.getElementById('loginButton').addEventListener('click', async () => {
                const logoutResponse = await fetch('/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                });
                if (logoutResponse.ok) {
                    alert('로그아웃 되었습니다.');
                    window.location.href = 'login.html';
                }
            });
        } else {
            // 로그인 상태가 아닌 경우
            document.getElementById('loginButton').textContent = 'Login';
            document.getElementById('loginButton').addEventListener('click', () => {
                // 로그인 모달 열기 또는 로그인 페이지로 이동
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

// 로그아웃 버튼 이벤트 리스너
document.getElementById('loginButton').addEventListener('click', async () => {
    const logoutResponse = await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include'
    });
    if (logoutResponse.ok) {
        alert('로그아웃 되었습니다.');
        window.location.href = 'login.html';
    } else {
        alert('로그아웃 중 오류가 발생했습니다.');
    }
});
