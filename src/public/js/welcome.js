document.addEventListener('DOMContentLoaded', function() {
    // 等待页面加载完成后，添加 'show' 类以触发淡入效果
    setTimeout(function() {
        document.getElementById('welcomeMessage').classList.add('show');
    }, 500); // 延迟 0.5 秒后开始淡入
});