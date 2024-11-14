// menuActivation.js

// URL 활성화 메뉴 표시 함수
function setActiveMenuItem() {
    const currentPath = window.location.pathname.split("/").pop();
    const menuItems = document.querySelectorAll(".navbar-nav .nav-link");

    menuItems.forEach(item => {
        if (item.getAttribute("href") === currentPath) {
            item.classList.add("active");
        }
    });
}
