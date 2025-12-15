// ====================================
// 主题切换与模块切换
// ====================================

// 主题切换按逻辑
function applyTheme(theme) {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (!themeToggleBtn) { return; }
    document.body.classList.remove('dark-mode', 'light-mode');

    let iconClass = '<i class="fas fa-moon"></i>'; // 默认图标 (Light Mode)
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        iconClass = '<i class="fas fa-sun"></i>'; // 暗黑模式时显示太阳图标
        localStorage.setItem('theme', 'dark');
    } else { 
        localStorage.removeItem('theme'); // 清除存储，确认使用默认模式
    }

    themeToggleBtn.innerHTML = iconClass;
}

function initThemeToggle() {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const storedTheme = localStorage.getItem('theme');
    applyTheme(storedTheme); 
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isCurrentlyDark = document.body.classList.contains('dark-mode');
            const newTheme = isCurrentlyDark ? 'light' : 'dark'; 
            applyTheme(newTheme);
        });
    }
}

// 插入模式切换与主题切换角标 HTML
function createCornerHTML() {
    const adminPathPrefix = window.adminPath || '';
    // 定义模式切换列表
    const modes = [ // 此处为相对于管理路径
        { path: '/', icon: 'fas fa-link', text: '短链' }, 
        { path: '/img', icon: 'fas fa-image', text: '图床' },
        { path: '/note', icon: 'fas fa-note-sticky', text: '笔记' },
    ];
    
    // 构建下拉菜单的 HTML
    const modeItemsHTML = modes.map(mode => {
        let finalPath;
        if (adminPathPrefix) {
            if (mode.path === '/') { finalPath = adminPathPrefix; } 
            else { finalPath = adminPathPrefix + mode.path; }
        } 
        else { finalPath = mode.path; } // 未知路径返回404
        return `<li data-path="${finalPath}">
                 <i class="${mode.icon} me-2"></i>${mode.text}
               </li>`;
    }).join('');

    // 构建完整的角标按钮区域 HTML
    const cornerBtnsHTML = `
        <div class="corner-btns">
            <div class="mode-toggle-wrapper">
                <button class="btn btn-sm type-toggle-btn" id="typeToggleBtn" title="切换模式">
                    <i class="fas fa-cog"></i>
                </button>
                <ul class="mode-select-dropdown" id="modeSelectDropdown">
                    ${modeItemsHTML}
                </ul>
            </div>
            <button class="btn btn-sm theme-toggle-btn" id="themeToggleBtn" title="切换主题">
                <i class="fas fa-moon"></i>
            </button>
        </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', cornerBtnsHTML); // 插入到 body 的最前面
}

// 模式切换下拉菜单
function initModeSelector() {
    const toggleButton = document.getElementById('typeToggleBtn');
    const dropdown = document.getElementById('modeSelectDropdown');
    if (!toggleButton || !dropdown) { return; }
    const modeItems = dropdown.querySelectorAll('li');

    // 切换下拉菜单的显示/隐藏
    toggleButton.addEventListener('click', function(event) {
        event.stopPropagation();
        dropdown.classList.toggle('active');
    });

    // 处理模式选择项的点击事件
    modeItems.forEach(item => {
        item.addEventListener('click', function() {
            const path = this.getAttribute('data-path'); // 从 data-path 获取已经计算好的完整路径
            if (path) { 
                dropdown.classList.remove('active'); 
                window.location.href = path; // 直接跳转到完整路径
            }
        });
    });

    // 点击页面其他地方隐藏下拉菜单
    document.addEventListener('click', function(event) {
        const isClickInside = dropdown.contains(event.target) || toggleButton.contains(event.target);
        if (!isClickInside && dropdown.classList.contains('active')) {
            dropdown.classList.remove('active');
        }
    });
}

// 初始化事件监听器
document.addEventListener('DOMContentLoaded', function () {
    createCornerHTML(); // 先插入角标
    initThemeToggle(); // 初始化主题功能
    initModeSelector(); // 初始化模式选择功能
});