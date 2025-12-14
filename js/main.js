// let apiSrv = window.location.pathname;
let buildValueItemFunc = buildValueTxt; // 这是默认行为, 在不同的模式中可以设置为不同的行为
let longUrlElement;
let urlListElement;

// 解析路径以确定当前模式
const pathnameSegments = window.location.pathname.split('/').filter(Boolean);
window.adminPath = pathnameSegments[0] ? '/' + pathnameSegments[0] : '';
const modeFromPath = pathnameSegments[1];
let apiSrv = window.adminPath;
let api_password = document.querySelector("#passwordText").value;
window.current_mode = ['img', 'note', 'paste'].includes(modeFromPath) ? modeFromPath : 'link';
window.visit_count_enabled = false;

function buildValueTxt(longUrl) {
  let valueTxt = document.createElement('div')
  valueTxt.classList.add("form-control")
  valueTxt.innerText = longUrl
  return valueTxt
}

function clearLocalStorage() {
  localStorage.clear()
}

// 显示结果模态框
function showResultModal(message) {
  document.getElementById("result").innerHTML = message;
  const modal = new bootstrap.Modal(document.getElementById('resultModal'));
  modal.show();
}

// 模态框复制短链接
function handleModalCopy(text) {
  const btn = document.getElementById('copyResultBtn');
  const originalHTML = btn.innerHTML;
  const modalElement = document.getElementById('resultModal');
  const modal = bootstrap.Modal.getInstance(modalElement);

  // 处理复制成功后的视觉反馈和恢复
  const onSuccess = (delay = 1000) => {
    btn.innerHTML = '<i class="fas fa-check me-2"></i>已复制';
    btn.classList.replace('btn-primary', 'btn-success'); 
    setTimeout(() => { if (modal) { modal.hide(); } }, delay);
    setTimeout(() => { btn.innerHTML = originalHTML; btn.classList.replace('btn-success', 'btn-primary'); }, delay);
  };

  // 处理复制失败后的视觉反馈和恢复
  const onFailure = (delay = 1000) => {
    console.error('复制失败：无法执行复制操作');
    btn.innerHTML = '<i class="fas fa-times me-2"></i>失败';
    setTimeout(() => { btn.innerHTML = originalHTML; }, delay);
  };

  navigator.clipboard.writeText(text).then(() => {
      onSuccess(); // 现代 API 成功
  }).catch(() => { // 回退方案
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      const success = document.execCommand('copy');
      document.body.removeChild(input);
      success ? onSuccess() : onFailure();
  });
}

// 复制短链接
function copyShortUrl(text, btnId) {
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const originalIcon = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check" style="color:white"></i>'; // 复制后显示白色的 √
    setTimeout(() => { btn.innerHTML = originalIcon; }, 2000);
  });
}

// 获取模式名称
function getModeName(mode) {
  switch (mode) {
    case 'link': return '短链';
    case 'img': return '图床';
    case 'note': return '记事本';
    case 'paste': return '剪贴板';
    default: return '数据'; // 安全回退
  }
}

// 在不同模式下加载不同数据
function isDataMode(value, mode) {
  if (!value) return false;
  let isRelevant = false;
  
  switch (mode) {
    case 'link': // 短链接：值必须是 URL
      if (value.startsWith('http')) { isRelevant = true; }
      break;
    case 'img': // 图床：值必须是 Base64 Data URI (保持您代码中的 'img')
      if (value.startsWith('data:image/')) { isRelevant = true; }
      break;
    case 'note':
    case 'paste': // 记事本/剪贴板：值不能是 URL 或 Base64 Data URI
      if (!value.startsWith('http') && !value.startsWith('data:image/')) { isRelevant = true; }
      break;
    default: // 默认模式，不过滤
      isRelevant = true; 
      break;
  }
  return isRelevant;
}

// 加载本地存储列表
function loadUrlList() {
  const urlList = urlListElement;
  urlList.innerHTML = ''; // 清空列表，移除加载动画
  const currentMode = window.current_mode || 'link'; // 获取当前模式
  
  let longUrl = longUrlElement.value.trim();
  let keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key === 'theme') { continue; } // 跳过主题设置项
    keys.push(key);
  }
  
  keys.reverse().forEach(keyShortURL => {
    let valueLongURL = localStorage.getItem(keyShortURL)
    if (!isDataMode(valueLongURL, currentMode)) { return; }
    // 如果长链接为空，加载所有匹配模式的记录；否则，加载匹配模式且匹配输入框的记录
    if (longUrl === "" || (longUrl === valueLongURL)) { addUrlToList(keyShortURL, valueLongURL) }
  });
  
  // 如果列表为空，显示提示 (动态提示)
  if (urlList.children.length === 0) {
    const modeName = getModeName(currentMode);
    urlList.innerHTML = `<div class="result-tip text-center py-3">暂无${modeName}记录</div>`;
  }
}

function addUrlToList(shortUrl, longUrl) {
  let urlList = urlListElement;
  let child = document.createElement('div')
  child.classList.add("list-group-item")
  let keyItem = document.createElement('div')
  keyItem.classList.add("input-group")

  // 短链接信息
  let keyTxt = document.createElement('span')
  keyTxt.classList.add("form-control")
  keyTxt.innerText = window.location.protocol + "//" + window.location.host + "/" + shortUrl
  keyItem.appendChild(keyTxt)

  // 删除按钮
  let delBtn = document.createElement('button')
  delBtn.setAttribute('type', 'button')
  delBtn.classList.add("btn", "btn-danger")
  delBtn.setAttribute('onclick', 'deleteShortUrl(\"' + shortUrl + '\")')
  delBtn.setAttribute('id', 'delBtn-' + shortUrl)
  delBtn.innerHTML = '<i class="fas fa-trash-alt" title="删除短链接"></i>'
  keyItem.appendChild(delBtn)

  // 只有当 visit_count 为 true 时才显示统计按钮
  if (window.visit_count_enabled === true) {
    let qryCntBtn = document.createElement('button')
    qryCntBtn.setAttribute('type', 'button')
    qryCntBtn.classList.add("btn", "btn-info")
    qryCntBtn.setAttribute('onclick', 'queryVisitCount(\"' + shortUrl + '\")')
    qryCntBtn.setAttribute('id', 'qryCntBtn-' + shortUrl)
    qryCntBtn.innerHTML = '<i class="fas fa-chart-line" title="访问统计"></i>'
    keyItem.appendChild(qryCntBtn)
  }

  // 复制按钮
  const copyBtn = document.createElement('button');
  copyBtn.setAttribute('type', 'button');
  copyBtn.classList.add('btn', 'btn-success');
  copyBtn.setAttribute('id', `copyBtn-${shortUrl}`);
  copyBtn.innerHTML = '<i class="fas fa-copy" title="复制短链接"></i>';
  copyBtn.onclick = () => copyShortUrl(
    `${window.location.protocol}//${window.location.host}/${shortUrl}`,
    `copyBtn-${shortUrl}`
  );
  keyItem.appendChild(copyBtn);

  // 显示二维码按钮
  let qrcodeBtn = document.createElement('button')
  qrcodeBtn.setAttribute('type', 'button')
  qrcodeBtn.classList.add("btn", "btn-info",)
  qrcodeBtn.setAttribute('onclick', 'toggleQrcode(\"' + shortUrl + '\")')
  qrcodeBtn.setAttribute('id', 'qrcodeBtn-' + shortUrl)
  qrcodeBtn.innerHTML = '<i class="fas fa-qrcode" title="显示二维码"></i>'
  keyItem.appendChild(qrcodeBtn)
  child.appendChild(keyItem)

  // 插入一个二维码占位
  let qrcodeContainer = document.createElement('div');
  qrcodeContainer.setAttribute('id', 'qrcode-' + shortUrl);
  qrcodeContainer.classList.add('qrcode-container'); 
  child.appendChild(qrcodeContainer);
  child.appendChild(buildValueItemFunc(longUrl)) // 长链接信息
  urlList.append(child)
}

// 二维码切换逻辑
function toggleQrcode(shortUrl) {
  const qrcodeContainer = document.getElementById('qrcode-' + shortUrl); 
  const qrcodeBtn = document.getElementById('qrcodeBtn-' + shortUrl);
  const fullUrl = window.location.protocol + "//" + window.location.host + "/" + shortUrl;
  const isVisible = qrcodeContainer.classList.toggle('qrcode-visible');
  
  if (isVisible) {
    // 生成 QR code
    qrcodeContainer.innerHTML = '';
    $(qrcodeContainer).qrcode({
      render: 'canvas',
      minVersion: 1,
      maxVersion: 40,
      ecLevel: 'Q', // 'L', 'M', 'Q' or 'H'
      size: 128,
      text: fullUrl
    });
    qrcodeBtn.classList.replace('btn-info', 'btn-warning');
    qrcodeBtn.innerHTML = '<i class="fas fa-qrcode" title="隐藏二维码"></i>';
  } else {
  setTimeout(() => {
    qrcodeContainer.innerHTML = '';
  }, 500);
  qrcodeBtn.classList.replace('btn-warning', 'btn-info');
  qrcodeBtn.innerHTML = '<i class="fas fa-qrcode" title="显示二维码"></i>';
  }
}

// 生成短链
function shorturl(event) {
  if (event) {
    if (event.key === "Enter") {
      event.preventDefault();
    } else {
      return;
    }
  }
  if (longUrlElement.value == "") { showResultModal("URL不能为空!"); return; }

  const addBtn = document.getElementById("addBtn");
  const originalBtnHtml = addBtn.innerHTML;
  addBtn.disabled = true;
  addBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 提交中...';
  document.getElementById('keyPhrase').value = document.getElementById('keyPhrase').value
    .replace(/[\s#*|]/g, "-"); // 替换空格 (\s)、#、*、| 为连字符 (-)
  
  const api_password = document.querySelector("#passwordText").value;
  fetch(apiSrv, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cmd: "add",
      url: longUrlElement.value.trim(),
      key: document.querySelector("#keyPhrase").value,
      password: api_password,
      type: window.current_mode || 'link'
    })
  })
  .then(response => response.json())
  .then(data => {
    addBtn.disabled = false;
    addBtn.innerHTML = originalBtnHtml; // 恢复保存的原始 HTML
    if (data.status == 200) {
      const shortUrl = window.location.protocol + "//" + window.location.host + "/" + data.key;
      // 绑定模态框复制按钮事件
      document.getElementById("copyResultBtn").onclick = () => { handleModalCopy(shortUrl); };
      showResultModal(shortUrl); // 生成短链后显示模态框
      localStorage.setItem(data.key, longUrlElement.value); // 添加到本地存储和KV列表
      addUrlToList(data.key, longUrlElement.value);
    } else {
      showResultModal(data.error || "生成短链接失败");
    }
  })
  .catch(err => {
    console.error("Error:", err);
    addBtn.disabled = false;
    addBtn.innerHTML = originalBtnHtml;
    showResultModal("请求失败，请重试");
  });
}

// 删除短链
function deleteShortUrl(delKeyPhrase) {
  document.getElementById("delBtn-" + delKeyPhrase).disabled = true;
  document.getElementById("delBtn-" + delKeyPhrase).innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';

  const api_password = document.querySelector("#passwordText").value;
  fetch(apiSrv, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cmd: "del",
      key: delKeyPhrase,
      password: api_password
    })
  }).then(function (response) {
    return response.json();
  }).then(function (myJson) {
    if (myJson.status == "200") {
      localStorage.removeItem(delKeyPhrase)
      loadUrlList()
      showResultModal("已删除")
    } else {
      showResultModal(myJson.error || "删除短链接失败");
    }
  }).catch(function (err) {
    showResultModal("删除请求失败，请重试!");
    console.log(err);
  })
}

// 查询短链访问计数
function queryVisitCount(qryKeyPhrase) {
  const btn = document.getElementById("qryCntBtn-" + qryKeyPhrase);
  const originalIcon = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';

  const api_password = document.querySelector("#passwordText").value;
  fetch(apiSrv, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cmd: "qrycnt",
      key: qryKeyPhrase,
      password: api_password
    })
  }).then(function (response) {
    return response.json();
  }).then(function (myJson) {
    if (myJson.status == "200" && myJson.countlist && myJson.countlist.length > 0) {
      const count = myJson.countlist[0].count;
      btn.innerHTML = count; // 成功：显示访问计数
    } else {
      showResultModal(myJson.error || "查询访问计数失败");
      btn.innerHTML = originalIcon; // 恢复图标
    }
    btn.disabled = false;
  })
  .catch(function (err) {
    showResultModal("查询统计请求失败，请重试");
    console.log(err);
    btn.innerHTML = originalIcon; // 恢复图标
    btn.disabled = false; // 启用按钮
  });
}

// 查询短链
function query1KV(event) {
  if (event) {
    if (event.key === "Enter") {
      event.preventDefault();
    } else {
      return;
    }
  }

  let qryKeyPhrase = document.getElementById("keyForQuery").value;
  if (qryKeyPhrase == "") { return }
  const api_password = document.querySelector("#passwordText").value;
  
  fetch(apiSrv, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cmd: "qry",
      key: qryKeyPhrase,
      password: api_password
    })
  }).then(function (response) {
    return response.json();
  }).then(function (myJson) {
    if (myJson.status == "200" && myJson.qrylist && myJson.qrylist.length > 0) {
      const item = myJson.qrylist[0];
      longUrlElement.value = item.value;
      document.getElementById("keyPhrase").value = item.key;
      longUrlElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true, }))
    } else {
      showResultModal(myJson.error || "查询短链接失败");
    }
  }).catch(function (err) {
      console.log(err);
      showResultModal("未知错误, 请重试!");
  })
}

// 从KV加载记录
function loadKV() {
  const currentMode = window.current_mode || 'link';
  const api_password = document.querySelector("#passwordText").value;
  
  fetch(apiSrv, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cmd: "qryall",
      password: api_password
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.status == 200 && data.qrylist) {
      clearLocalStorage();
      let loadedCount = 0;
      data.qrylist.forEach(item => { // 遍历 qrylist
        const key = item.key;
        const value = item.value;
        if (key === 'theme') { return; } 
        if (isDataMode(value, currentMode)) { localStorage.setItem(key, value); loadedCount++; }
      });
      loadUrlList();
      const modeName = getModeName(currentMode);
      showResultModal(`成功加载 ${loadedCount} 条${modeName}记录`);
    } else {
      showResultModal(data.error || "加载失败");
    }
  })
  .catch(err => {
    console.error("Error:", err);
    showResultModal("请求失败，请重试");
  });
}

// 事件绑定：DOM加载完成后初始化 Popover
document.addEventListener('DOMContentLoaded', function () {
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });

  longUrlElement = document.querySelector("#longURL");
  urlListElement = document.querySelector("#urlList");

  // 获取后端配置
  function loadConfig() {
    fetch(apiSrv, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cmd: "config",
        password: api_password
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.status == 200) {
        window.visit_count_enabled = data.visit_count;
        window.allow_custom_key = data.custom_link;
        const customKeyInput = document.getElementById('keyPhrase');
        if (data.custom_link) {
          // 功能开启：启用输入框，显示默认 placeholder
          customKeyInput.disabled = false;
          customKeyInput.placeholder = customKeyInput.getAttribute('placeholder') || "输入大小写字母和数字";
        } else {
          // 功能关闭：禁用输入框，修改 placeholder
          customKeyInput.disabled = true;
          customKeyInput.placeholder = "功能未开启, 随机生成短链Key";
          customKeyInput.value = ""; // 清空可能已有的输入
        }
        // 可以在这里存储其他配置
      }
      loadUrlList();
    })
    .catch(err => {
      console.error("加载配置时出错:", err);
      loadUrlList();
    });
  }
  document.getElementById("passwordText").readOnly = true;
  loadConfig();
});
