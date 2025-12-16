# 🚀 Slink API 文档

## ℹ️ 基本信息

- **API 端点:** `/<ADMIN>` (其中 `<ADMIN>` 是您的环境变量 `ADMIN` 的值，默认是 `admin`)
- **请求方法:** `POST`
- **请求头:** `Content-Type: application/json`
- **API 秘钥:** `password` 字段，必须包含环境变量 `PASSWORD` 的值（默认 `apipass`）
- **受保护 Key:** `["password", "link", "note"]` 列表中的 Key 无法作为主 Key 进行 API 操作（添加、删除、查询）

---

## 参数说明

|**参数**|**必需**|**描述**|**适用命令**|**格式**|
|---|---|---|---|---|
|**`cmd`**|是|操作命令。支持 `add`, `qry`, `del`, `delall`, `qrycnt`, `qryall`, `config`。|所有|字符串|
|**`password`**|是|API 秘钥，用于权限验证。|所有|字符串|
|**`type`**|否 (`add` 必传)|记录模式：`link`（短链）、`note`（记事本）。如果 API 端点为 `/<ADMIN>/note` 且请求中未提供 `type`，则默认为 `note`。|`add`, `del`, `delall`, `qryall`|字符串|
|**`url`**|`add` 必需|源内容：长链 URL 或文本内容。|`add`|字符串|
|**`key`**|否|Key 名称。用于自定义 Key (`add`) 或指定操作目标 (`qry`, `del`, `qrycnt` 等)。|`add`, `qry`, `del`, `delall`, `qrycnt`|字符串 (单个) 或 字符串数组 (批量)|

---

# 1. 添加记录 (`cmd: "add"`)

此命令用于创建新的短链或笔记。不支持数组形式的 `key` 参数。

|**参数名**|**必需**|**描述**|
|---|---|---|
|`type`|是|必须为 `link` 或 `note`。|

## 💻 `curl` 示例 (自定义 Key)

```bash
curl -X POST https://<worker_domain>/<ADMIN> \
-H "Content-Type: application/json" \
-d '{
  "cmd": "add",
  "url": "https://www.google.com/search?q=custom+key+example",
  "key": "mykey",
  "type": "link",
  "password": "apipass"
}'
```

## 响应示例 (`status: 200`)

```json
{
  "status": 200,
  "key": "随机或自定义的短链Key",
  "error": ""
}
```

---

# 2. 查询记录

## 2.1 查询单个 Key (`cmd: "qry"`)

**Worker 逻辑：** 仅查询 KV 中主 Key 对应的值。

### 💻 `curl` 示例

```bash
curl -X POST https://<worker_domain>/<ADMIN>
-H "Content-Type: application/json"
-d '{
  "cmd": "qry",
  "key": "link1",
  "password": "apipass"
}'
```

### 响应示例 (`status: 200`)

```json
{
  "status": 200,
  "error": "",
  "key": "link1",
  "url": "https://example.com/long/url/one"
}
```

## 2.2 查询所有 Key (`cmd: "qryall"`)

**Worker 逻辑：** 返回所有非辅助 Key（非模式 Key、非 `-count`、非 SHA-512 Hash Key）的列表。可以通过 `type` 参数过滤结果。

|**参数名**|**必需**|**描述**|
|---|---|---|
|`type`|否|过滤模式 (`link`, `note` 等)。如果为空，则查询所有主 Key。|

### 💻 `curl` 示例 (查询所有 'link' 模式记录)

```bash
curl -X POST https://<worker_domain>/<ADMIN>
-H "Content-Type: application/json"
-d '{
  "cmd": "qryall",
  "type": "link",
  "password": "apipass"
}'
```

### 响应示例 (`status: 200`)

**注意：** 响应字段名为 `qrylist`，且包含 `type` 字段。

```json
{
  "status": 200,
  "error": "",
  "qrylist": [
    { "key": "link1", "value": "https://example.com/long/url/one", "type": "link" },
    { "key": "note1", "value": "这是我的笔记内容", "type": "note" } 
    // ... 如果 type 为空，则可能包含多种类型
  ]
}
```

---

# 3. 删除记录

## 3.1 删除单个 Key (`cmd: "del"`)

**Worker 逻辑：** 删除单个主 Key 及其关联的辅助 Key（模式 Key、`-count`、SHA-512 Hash Key）。

| **参数名** | **必需** | **描述**                                 |
| ------- | ------ | -------------------------------------- |
| `type`  | 否      | 如果提供 `type`，将删除对应的模式 Key (`type:key`)。 |

### 💻 `curl` 示例

```bash
curl -X POST https://<worker_domain>/<ADMIN>
-H "Content-Type: application/json"
-d '{
  "cmd": "del",
  "key": "link1",
  "type": "link",
  "password": "apipass"
}'
```

### 响应示例 (`status: 200`)

```json
{
  "status": 200,
  "error": "",
  "key": "link1"
}
```

## 3.2 删除多个 Key 或全部 Key (`cmd: "delall"`)

**Worker 逻辑：** 根据 `key` 数组和 `type` 参数执行批量或全量删除。

| **参数组合**                              | **逻辑描述**                                                        |
| ------------------------------------- | --------------------------------------------------------------- |
| `key`: `["k1", "k2"]`, `type`: `link` | 删除 **link** 模式下 Key 为 `k1` 和 `k2` 的所有数据（主 Key、模式 Key、辅助 Key）。   |
| `key`: `[]` 或省略, `type`: `link`       | 删除 **link** 模式下的**所有**主 Key 及其辅助 Key。                           |
| `key`: `[]` 或省略, `type`: (省略)         | 删除 KV 中**所有非受保护**的主 Key 和所有辅助 Key (包括所有模式 Key, 计数 Key, 哈希 Key)。 |

### 💻 `curl` 示例 1: 删除多个 Key (指定模式)

```bash
curl -X POST https://<worker_domain>/<ADMIN>
-H "Content-Type: application/json"
-d '{
  "cmd": "delall",
  "key": ["link1","link2"],
  "type": "link",
  "password": "apipass"
}'
```

### 💻 `curl` 示例 2: 删除全部 Key (所有模式)

Bash

```json
curl -X POST https://<worker_domain>/<ADMIN>
-H "Content-Type: application/json"
-d '{
  "cmd": "delall",
  "password": "apipass"
}'
```

### 响应示例 (`status: 200`)

```json
{
  "status": 200,
  "error": "",
  "deleted_count": 2 // 成功删除的主 Key 数量
}
```

---

# 4. 查询访问计数

## 4.1 查询单个 Key 计数 (`cmd: "qrycnt"`)

**Worker 逻辑：** 仅查询单个 Key 的访问计数。需要环境变量 `VISIT_COUNT` 开启。

### 💻 `curl` 示例

```bash
curl -X POST https://<worker_domain>/<ADMIN>
-H "Content-Type: application/json"
-d '{
  "cmd": "qrycnt",
  "key": "link1",
  "password": "apipass"
}'
```

### 响应示例 (`status: 200`)

```json
{
  "status": 200,
  "error": "",
  "key": "link1",
  "count": "42" // 访问计数，字符串格式
}
```

---

# 5. 获取配置 (`cmd: "config"`)

用于获取 Worker 的配置信息。

## 💻 `curl` 示例

```bash
curl -X POST https://<worker_domain>/<ADMIN>
-H "Content-Type: application/json"
-d '{
  "cmd": "config",
  "password": "apipass"
}'
```

## 响应示例 (`status: 200`)

```json
{
  "status": 200,
  "visit_count": true, // VISIT_COUNT 环境变量
  "custom_link": true, // CUSTOM_LINK 环境变量
  "error": ""
}
```

---

# 6. 直接访问 / 重定向 (非 API)

当用户通过浏览器 (GET 请求) 访问 Worker URL 时触发的功能：

| **访问路径**                                 | **行为**                                                            |
| ---------------------------------------- | ----------------------------------------------------------------- |
| `https://<YOUR_WORKER_URL>/`             | 返回 `404` 页面。                                                      |
| `https://<YOUR_WORKER_URL>/<ADMIN>`      | 返回短链管理页面 (`main_html`)。                                           |
| `https://<YOUR_WORKER_URL>/<ADMIN>/note` | 返回笔记管理页面 (`note/index.html`)。                                     |
