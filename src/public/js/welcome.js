const bg = document.getElementById("content");

document.addEventListener('DOMContentLoaded', function () {

    setTimeout(function () {
        document.getElementById('welcomeMessage').classList.add('show');
    }, 500); // 延迟 0.5 秒后开始淡入
});