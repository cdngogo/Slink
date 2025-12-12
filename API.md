## 🚀 Slink API 文档

- **API端点:** `/<password>` 或 `/<password<>/<type>`
  - password: 环境变量 `PASSWORD`，默认为 `admin`
  - type: 支持 `link` `img` `note` `paste` 四种
- **请求方法:** `POST`
- **请求头:** `Content-Type: application/json`
- **请求体:** 必须包含 `cmd` 字段
- **受保护 Key:** `["password", "link", "img", "note", "paste", "admin"]` 列表中的 Key 无法被 API 操作（添加、删除、查询）

---

### 1. 添加/生成短链接

#### 💻 `curl` 示例 (自定义 Key)

```bash
curl -X POST https://<worker_domain>/<password>/<type> \
-H "Content-Type: application/json" \
-d '{
    "cmd": "add",
    "url": "https://www.google.com/search?q=custom+key+example",
    "key": "mykey"
}'
```

#### 响应示例 (`status: 200`)

```json
{
  "status": 200,
  "key": "随机或自定义的短链Key", 
  "error": ""
}
```

---

### 2. 查询单个链接

#### 💻 `curl` 示例

```bash
curl -X POST https://<worker_domain>/<password> \
-H "Content-Type: application/json" \
-d '{
    "cmd": "qry",
    "key": "mykey"
}'
```

#### 响应示例 (`status: 200`)

```json
{
  "status": 200,
  "error": "",
  "key": "mykey",
  "url": "https://www.google.com/search?q=custom+key+example"
}
```

### 3. 查询全部链接

#### 💻 `curl` 示例

```bash
curl -X POST https://<worker_domain><password> \
-H "Content-Type: application/json" \
-d '{
    "cmd": "qryall"
}'
```

#### 响应示例 (`status: 200`)

```json
{
  "status": 200,
  "error": "",
  "kvlist": [
    { "key": "randomkey1", "value": "http://longurl1.com" },
    { "key": "mykey", "value": "http://longurl2.com" }
  ]
}
```

---

### 4. 删除短链接

#### 💻 `curl` 示例

```bash
curl -X POST https://<worker_domain>/<password> \
-H "Content-Type: application/json" \
-d '{
    "cmd": "del",
    "key": "mykey"
}'
```

#### 响应示例 (`status: 200`)

```json
{
  "status": 200,
  "key": "已删除的Key",
  "error": ""
}
```

---

### 5. 查询访问计数

#### 💻 `curl` 示例

```bash
curl -X POST https://<worker_domain>/<password> \
-H "Content-Type: application/json" \
-d '{
    "cmd": "qrycnt",
    "key": "randomkey1"
}'
```

#### 响应示例 (`status: 200`)

```json
{
  "status": 200,
  "error": "",
  "key": "randomkey1",
  "count": "42" // 总访问次数
}
```

---

## 直接访问 / 重定向 (非 API)

当用户通过浏览器访问 Worker URL 时触发的功能。

| **访问路径**                                 | **行为**                 |
| ------------------------------------------- | ------------------------ |
| `https://<YOUR_WORKER_URL>/`                | 返回 `404` 页面         |
| `https://<YOUR_WORKER_URL>/<YOUR_PASSWORD>` | 返回前端管理页面    |
| `https://<YOUR_WORKER_URL>/<YOUR_PASSWORD>/link`   | 短链接系统  |
| `https://<YOUR_WORKER_URL>/<YOUR_PASSWORD>/img`     | 图床系统 |
| `https://<YOUR_WORKER_URL>/短链key`   | 直接访问短链接或图床链接  |
