# 登录、注册、收藏功能规范

本文档描述如何在 Venera 漫画源中添加登录、注册、收藏功能。

## 目录

- [概述](#概述)
- [登录功能](#登录功能)
  - [account 对象](#account-对象)
  - [登录 API 发现方法](#登录-api-发现方法)
  - [Cookies 管理](#cookies-管理)
- [注册功能](#注册功能)
- [收藏功能](#收藏功能)
  - [favorites 对象](#favorites-对象)
  - [双重 ID 问题](#双重-id-问题)
  - [ID 缓存机制](#id-缓存机制)
- [防盗链处理](#防盗链处理)
- [辅助方法](#辅助方法)

---

## 概述

大部分漫画网站都支持用户登录、注册和收藏功能。在 Venera 漫画源中，这些功能通过以下对象实现：

| 功能 | 对象 | 必需 |
|------|------|------|
| 登录/注销 | `account` | 可选 |
| 注册链接 | `account.registerWebsite` | 可选 |
| 收藏 | `favorites` | 可选 |
| 图片防盗链 | `onImageLoad` / `onThumbnailLoad` | 推荐 |

---

## 登录功能

### account 对象

```javascript
account = {
    login: async (username, password) => {
        // 调用登录 API
        // 验证返回结果
        // 保存 cookies
        // 返回 "ok"
    },

    logout: () => {
        // 清除保存的 cookies
    },

    registerWebsite: "https://example.com/register"
}
```

### 登录 API 发现方法

1. **分析登录页面 HTML**
   ```bash
   curl -s "https://m.example.com/user/login" | grep -E 'form|input|login|password|submit'
   ```

2. **检查页面引入的 JS 文件**
   ```bash
   curl -s "https://m.example.com/user/login" | grep -o 'src="[^"]*\.js"'
   ```

3. **在 JS 文件中搜索登录相关代码**
   ```bash
   curl -s "https://m.example.com/packs/mccms/base.js" | grep -E 'login|password|submit|ajax'
   ```

4. **测试可能的 API 端点**
   ```bash
   curl -s "https://m.example.com/api/user/login?name=xxx&pass=xxx"
   ```

### Cookies 管理

登录成功后，服务器通常会通过 `Set-Cookie` 头设置 cookies。需要在登录成功后提取并保存：

```javascript
login: async (username, password) => {
    let url = `https://example.com/api/login?name=${username}&pass=${password}`
    let res = await Network.get(url)

    // 验证状态码
    if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`
    }

    // 解析响应
    let json = JSON.parse(res.body)
    if (json.code !== 1) {
        throw json.msg || "Login failed"
    }

    // 提取 cookies
    let cookies = []
    let setCookieHeader = res.headers['set-cookie']
    if (setCookieHeader) {
        let cookieArr = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]
        for (let cookie of cookieArr) {
            let match = cookie.match(/^([^;]+)/)
            if (match) {
                cookies.push(match[1])
            }
        }
    }

    // 保存 cookies
    if (cookies.length > 0) {
        this.saveData("example_cookie", cookies.join("; "))
    }

    return "ok"
}
```

### 登录状态检查

在需要验证登录的操作中（如收藏），需要检查是否已登录：

```javascript
get isLogged() {
    return this.loadData("example_cookie") !== null
}
```

### 注销功能

```javascript
logout: () => {
    this.deleteData("example_cookie")
}
```

---

## 注册功能

注册功能很简单，只需提供注册页面的 URL：

```javascript
account = {
    // ...
    registerWebsite: "https://example.com/user/login/reg"
}
```

---

## 收藏功能

### favorites 对象

```javascript
favorites = {
    multiFolder: false,  // true=支持多文件夹, false=单文件夹

    addOrDelFavorite: async (comicId, folderId, isAdding, favoriteId) => {
        // comicId: 漫画 ID（字符串或数字）
        // folderId: 文件夹 ID（多文件夹模式时使用）
        // isAdding: true=添加收藏, false=取消收藏
        // favoriteId: 收藏 ID（取消收藏时可能需要）
    },

    loadComics: async (page, folder) => {
        // page: 页码
        // folder: 文件夹 ID（多文件夹模式时使用）
        // 返回: { comics: [...], maxPage: 1 }
    }
}
```

### 收藏 API 发现方法

1. **在页面 JS 中搜索收藏相关代码**
   ```bash
   curl -s "https://m.example.com/packs/mccms/base.js" | grep -E 'fav|collect|addFav|delFav'
   ```

2. **测试可能的 API 端点**
   ```bash
   # 检查是否收藏
   curl -s "https://example.com/api/rend/isfav?did=123"

   # 添加收藏
   curl -s "https://example.com/api/rend/favadd?did=123"

   # 获取收藏列表
   curl -s "https://example.com/api/rend/fav"
   ```

### 双重 ID 问题

**重要问题**：很多漫画网站存在双重 ID 机制：

| 类型 | 示例 | 用途 |
|------|------|------|
| 字符串 slug | `yirenzhixia` | URL 路径、列表显示 |
| 数字 ID | `43501` | API 调用、数据库存储 |

**问题表现**：
- 列表页漫画 URL：`/comic/yirenzhixia`（字符串 slug）
- 收藏 API 参数：`did=43501`（数字 ID）
- 直接用 slug 调用收藏 API 会失败，返回 "ID不能为空"

### ID 缓存机制

为了解决这个问题，需要实现 ID 缓存机制：

```javascript
get numericIdMap() {
    return this.loadData("example_id_map") || {}
}

cacheNumericId(slug, numericId) {
    let map = this.numericIdMap
    map[slug] = numericId      // slug -> 数字ID
    map[numericId] = slug      // 数字ID -> slug（方便反向查找）
    this.saveData("example_id_map", map)
}

getNumericId(comicId) {
    // 如果已经是数字，直接返回
    if (/^\d+$/.test(comicId)) {
        return comicId
    }
    let map = this.numericIdMap
    if (map[comicId]) {
        return map[comicId]
    }
    return null
}

async ensureNumericId(comicId) {
    let numericId = this.getNumericId(comicId)
    if (numericId) {
        return numericId
    }

    // 缓存中没有，需要请求详情页获取
    let url = `https://example.com/comic/${comicId}`
    let res = await Network.get(url)
    let soup = new HtmlDocument(res.body)

    // 从页面中提取数字 ID（通常在收藏按钮的 data-id 属性中）
    let collectBtn = soup.querySelector('a.j-user-collect')
    if (collectBtn) {
        numericId = collectBtn.attributes['data-id'] || ''
    }

    soup.dispose()

    if (numericId && /^\d+$/.test(numericId)) {
        this.cacheNumericId(comicId, numericId)
        return numericId
    }

    throw "无法获取漫画ID"
}
```

### addOrDelFavorite 实现示例

```javascript
addOrDelFavorite: async (comicId, folderId, isAdding, favoriteId) => {
    // 确保获取到数字 ID
    let numericId = await this.ensureNumericId(comicId)

    let url = `https://example.com/api/rend/favadd?did=${numericId}`
    let res = await this.apiGet(url)
    let json = JSON.parse(res)

    if (json.code !== 1) {
        if (json.msg && json.msg.includes("登陆超时")) {
            throw "Login expired"
        }
        throw json.msg || "操作失败"
    }
}
```

### loadComics 实现示例

```javascript
loadComics: async (page, folder) => {
    let url = `https://example.com/api/rend/fav`
    let res = await this.apiGet(url)
    let json = JSON.parse(res)

    if (!json.data || !Array.isArray(json.data)) {
        return { comics: [], maxPage: 1 }
    }

    let comics = []
    for (let item of json.data) {
        let numericId = item.id ? item.id.toString() : ''
        let slug = item.yname || ''  // API 返回的字符串 slug
        let title = item.name || ''
        let cover = item.pic || ''

        // 优先使用 slug（与其他页面保持一致）
        let comicId = slug || numericId

        if (comicId && title) {
            // 缓存 ID 映射
            if (slug && numericId) {
                this.cacheNumericId(slug, numericId)
            }

            comics.push(new Comic({
                id: comicId,
                title: title,
                cover: cover,
            }))
        }
    }

    return { comics: comics, maxPage: 1 }
}
```

---

## 防盗链处理

漫画网站通常使用 CDN 托管图片，需要设置正确的 Referer 头才能访问。

### onImageLoad（章节图片）

```javascript
onImageLoad = (url) => {
    return {
        headers: {
            "Referer": "https://example.com/",
        }
    }
}
```

### onThumbnailLoad（封面图片）

```javascript
onThumbnailLoad = (url) => {
    return {
        headers: {
            "Referer": "https://example.com/",
        }
    }
}
```

---

## 辅助方法

### 带登录态的 API 请求

```javascript
async apiGet(url) {
    let headers = {}
    if (this.isLogged) {
        headers["Cookie"] = this.cookie
    }
    let res = await Network.get(url, headers)
    if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`
    }
    return res.body
}

async apiPost(url, body) {
    let headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    if (this.isLogged) {
        headers["Cookie"] = this.cookie
    }
    let res = await Network.post(url, headers, body)
    if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`
    }
    return res.body
}
```

---

## 完整示例

以下是一个包含登录、注册、收藏功能的完整模板：

```javascript
class ExampleSource extends ComicSource {
    name = "示例漫画"
    key = "example"
    version = "1.0.0"
    minAppVersion = "1.6.0"
    url = "https://example.com/"

    // ========== 登录状态 ==========
    get isLogged() {
        return this.loadData("example_cookie") !== null
    }

    get cookie() {
        return this.loadData("example_cookie") || ""
    }

    // ========== ID 缓存 ==========
    get numericIdMap() {
        return this.loadData("example_id_map") || {}
    }

    cacheNumericId(slug, numericId) {
        let map = this.numericIdMap
        map[slug] = numericId
        map[numericId] = slug
        this.saveData("example_id_map", map)
    }

    async ensureNumericId(comicId) {
        // 检查缓存或请求详情页获取数字 ID
        // ...（见上文）
    }

    // ========== 带登录态的请求 ==========
    async apiGet(url) {
        let headers = {}
        if (this.isLogged) {
            headers["Cookie"] = this.cookie
        }
        let res = await Network.get(url, headers)
        if (res.status !== 200) {
            throw `Invalid status code: ${res.status}`
        }
        return res.body
    }

    // ========== 账号相关 ==========
    account = {
        login: async (username, password) => {
            // ...（见上文）
        },
        logout: () => {
            this.deleteData("example_cookie")
        },
        registerWebsite: "https://example.com/register"
    }

    // ========== 防盗链 ==========
    onImageLoad = (url) => {
        return {
            headers: {
                "Referer": this.url,
            }
        }
    }

    onThumbnailLoad = (url) => {
        return {
            headers: {
                "Referer": this.url,
            }
        }
    }

    // ========== 其他功能（explore, search, comic 等）==========

    // ========== 收藏功能 ==========
    favorites = {
        multiFolder: false,

        addOrDelFavorite: async (comicId, folderId, isAdding, favoriteId) => {
            let numericId = await this.ensureNumericId(comicId)
            let url = `https://example.com/api/favadd?did=${numericId}`
            let res = await this.apiGet(url)
            let json = JSON.parse(res)
            if (json.code !== 1) {
                if (json.msg && json.msg.includes("登陆超时")) {
                    throw "Login expired"
                }
                throw json.msg || "操作失败"
            }
        },

        loadComics: async (page, folder) => {
            // ...（见上文）
        },
    }

    comic = {
        loadInfo: async (id) => {
            // 加载详情页时，提取并缓存数字 ID
            // ...
            let collectBtn = soup.querySelector('a.j-user-collect')
            if (collectBtn) {
                let numericId = collectBtn.attributes['data-id'] || ''
                if (numericId && /^\d+$/.test(numericId)) {
                    this.cacheNumericId(id, numericId)
                }
            }
            // ...
        },
        // ...
    }
}
```

---

## 常见问题

### Q: 登录后 cookies 没有被保存？

A: 检查响应头中是否有 `Set-Cookie`，以及 cookie 的格式是否正确。可能需要手动提取 cookie 值。

### Q: 收藏时返回 "ID不能为空"？

A: 很可能是因为网站使用双重 ID，需要实现 ID 缓存机制，将字符串 slug 转换为数字 ID。

### Q: 图片加载失败？

A: 检查是否设置了正确的 Referer 头，或者图片 CDN 是否支持 Referer 检查。

### Q: 如何判断网站是否需要登录？

A: 尝试访问需要登录的功能（如收藏列表），如果返回 "登陆超时" 或类似错误，说明需要登录。
