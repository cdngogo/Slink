## 🚀 短链接服务 API 文档 (Cloudflare Worker)

**基础要求:**
- **请求方法:** 所有 API 操作均使用 **POST** 方法。
- **请求头:** 必须设置 `Content-Type: application/json`。
- **安全认证:** 所有请求体中都必须包含正确的 `cmd` 和 `password` 字段。
- **受保护 Key:** `["password"]` 列表中的 Key 无法被 API 操作（添加、删除、查询）。

---

### 1. 配置查询 API

用于客户端获取 Worker 的启用配置状态。

|**参数 (JSON Body)**|**类型**|**是否必须**|**描述**|
|---|---|---|---|
|`cmd`|String|是|必须为 `"config"`。|
|`password`|String|是|管理密码。|

#### 示例响应 (`status: 200`)

JSON

```
{
  "status": 200,
  "visit_count": true,   // 访问计数是否开启
  "result_page": false,  // 结果页面是否开启
  "custom_link": true    // 自定义短链是否开启
}
```

#### 💻 `curl` 示例

Bash

```bash
curl -X POST <YOUR_WORKER_URL> \
-H "Content-Type: application/json" \
-d '{
    "cmd": "config",
    "password": "<YOUR_PASSWORD>"
}'
```

---

### 2. 添加/生成短链接 API

用于创建新的短链接。

|**参数 (JSON Body)**|**类型**|**是否必须**|**描述**|
|---|---|---|---|
|`cmd`|String|是|必须为 `"add"`。|
|`password`|String|是|管理密码。|
|`url`|String|是|要缩短的原长链接 (在 `shorturl` 模式下会进行 URL 格式检查)。|
|`key`|String|否|自定义短链 Key。如果为空，系统将生成随机 Key。|

#### 示例响应 (`status: 200`)

JSON

```
{
  "status": 200,
  "key": "随机或自定义短链Key", 
  "error": ""
}
```

#### 💻 `curl` 示例 (自定义 Key)

Bash

```bash
curl -X POST <YOUR_WORKER_URL> \
-H "Content-Type: application/json" \
-d '{
    "cmd": "add",
    "password": "<YOUR_PASSWORD>",
    "url": "https://www.google.com/search?q=custom+key+example",
    "key": "mykey" 
}'
```

---

### 3. 查询单个链接 API

查询指定 Key 对应的原始链接。

|**参数 (JSON Body)**|**类型**|**是否必须**|**描述**|
|---|---|---|---|
|`cmd`|String|是|必须为 `"qry"`。|
|`password`|String|是|管理密码。|
|`key`|String|是|要查询的短链接 Key。|

#### 示例响应 (`status: 200`)

JSON

```
{
  "status": 200,
  "error": "",
  "key": "mykey",
  "url": "https://www.google.com/search?q=custom+key+example"
}
```

#### 💻 `curl` 示例

Bash

```bash
curl -X POST <YOUR_WORKER_URL> \
-H "Content-Type: application/json" \
-d '{
    "cmd": "qry",
    "password": "<YOUR_PASSWORD>",
    "key": "mykey"
}'
```

---

### 4. 删除短链接 API

根据 Key 删除 KV 中存储的短链接及其计数 (如果启用计数)。

|**参数 (JSON Body)**|**类型**|**是否必须**|**描述**|
|---|---|---|---|
|`cmd`|String|是|必须为 `"del"`。|
|`password`|String|是|管理密码。|
|`key`|String|是|要删除的短链接 Key。|

#### 示例响应 (`status: 200`)

JSON

```
{
  "status": 200,
  "key": "已删除的Key",
  "error": ""
}
```

#### 💻 `curl` 示例

Bash

```bash
curl -X POST <YOUR_WORKER_URL> \
-H "Content-Type: application/json" \
-d '{
    "cmd": "del",
    "password": "<YOUR_PASSWORD>",
    "key": "mykey"
}'
```

---

### 5. 查询全部链接 API

列出 KV 存储中所有非保护、非计数、非 SHA512 哈希的 Key-Value 对。

|**参数 (JSON Body)**|**类型**|**是否必须**|**描述**|
|---|---|---|---|
|`cmd`|String|是|必须为 `"qryall"`。|
|`password`|String|是|管理密码。|

#### 示例响应 (`status: 200`)

JSON

```
{
  "status": 200,
  "error": "",
  "kvlist": [
    { "key": "randomkey1", "value": "http://longurl1.com" },
    { "key": "mykey", "value": "http://longurl2.com" }
  ]
}
```

#### 💻 `curl` 示例

Bash

```bash
curl -X POST <YOUR_WORKER_URL> \
-H "Content-Type: application/json" \
-d '{
    "cmd": "qryall",
    "password": "<YOUR_PASSWORD>"
}'
```

---

### 6. 直接访问 / 重定向 (非 API)

当用户通过浏览器访问 Worker URL 时触发的功能。

| **访问路径**                                    | **行为**                                                        |
| ------------------------------------------- | ------------------------------------------------------------- |
| `https://<YOUR_WORKER_URL>/`                | 返回 `404 未找到` 页面。                                              |
| `https://<YOUR_WORKER_URL>/<YOUR_PASSWORD>` | 返回前端管理页面 (从 GitHub Pages 加载)。                                 |
| `https://<YOUR_WORKER_URL>/<SHORT_KEY>`     | **重定向:** 如果 Key 存在且非保护，则 302 重定向到原始链接。                        |
| `https://<YOUR_WORKER_URL>/<SHORT_KEY>`     | **显示图片:** 如果 `system_type` 是 `"imghost"`，则返回 Base64 解码后的图片内容。 |

