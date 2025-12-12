/**
 * 切换主题
 *
 * 依赖于：
 * 1. 按钮元素：<button id="themeToggleBtn">...</button>
 * 2. CSS 类：body.dark-mode 和 body.light-mode
 * 3. Font Awesome 图标：fas fa-sun / fas fa-moon
 */

function applyTheme(theme) {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (!themeToggleBtn) { console.warn("未找到主题切换按钮 (ID: themeToggleBtn)"); return; }

    document.body.classList.remove('dark-mode', 'light-mode'); // 移除所有手动设置的类，防止冲突
    if (theme === 'dark') {
        document.body.classList.add('dark-mode'); // 明确设置为暗黑模式
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>'; 
        localStorage.setItem('theme', 'dark');
    } else if (theme === 'light') {
        document.body.classList.add('light-mode'); // 明确设置为明亮模式
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>'; 
        localStorage.setItem('theme', 'light');
    } else {
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>'; // 默认为明亮模式
        localStorage.removeItem('theme'); 
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // 监听主题按钮
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) { applyTheme(storedTheme); }
    else { applyTheme('light'); }

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isCurrentlyDark = document.body.classList.contains('dark-mode');
            let newTheme = isCurrentlyDark ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }
});
