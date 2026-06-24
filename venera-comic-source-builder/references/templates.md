# 代码模板参考

---

## ⚠️ FlutterQjs 引擎限制（重要）

由于 Venera 使用 FlutterQjs 引擎执行漫画源脚本，存在以下限制：

### 1. 正则表达式不能包含中文

**错误写法：**
```javascript
// ❌ 错误 - 正则中包含中文
let match = html.match(/<title>(.*?第.*?)</title>/)
if (/^第/.test(title)) { ... }
```

**正确写法：**
```javascript
// ✅ 正确 - 使用字符串方法
let startIdx = html.indexOf("<title>")
let endIdx = html.indexOf("</title>")
let title = html.substring(startIdx + 7, endIdx)

// 判断是否以"第"开头
if (title.charAt(0) === '\u7B2C') { ... }
```

### 2. 方法必须包装在对象中

**错误写法：**
```javascript
// ❌ 错误 - 直接在类中定义
class MySource extends ComicSource {
    loadInfo: async (id) => { ... }  // 语法错误！
    loadEp: async (comicId, epId) => { ... }  // 语法错误！
}
```

**正确写法：**
```javascript
// ✅ 正确 - 包装在 comic 对象中
class MySource extends ComicSource {
    comic = {
        loadInfo: async (id) => { ... },
        loadEp: async (comicId, epId) => { ... },
        onImageLoad: (url, comicId, epId) => { ... }
    }
}
```

---

## 探索页模板

```javascript
explore = [
    {
        title: "与name一致",
        type: "multiPartPage",
        load: async (page) => {
            let res = await Network.get(this.url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let document = new HtmlDocument(res.body)
            let result = []

            // TODO: 根据实际页面结构调整选择器
            let boxes = document.querySelectorAll(".box")
            for (let box of boxes) {
                let sectionTitle = box.querySelector(".hd .title")?.text.trim() || ""
                let comics = []
                let items = box.querySelectorAll(".bd .item")

                for (let item of items) {
                    let link = item.querySelector("a")
                    if (!link) continue

                    let href = link.attributes["href"] || ""
                    let title = link.querySelector(".title")?.text.trim() || ""
                    let cover = link.attributes["data-original"] || ""

                    // 提取漫画ID
                    let id = ""
                    if (href.includes("/manhua/")) {
                        let parts = href.split("/manhua/")
                        if (parts.length > 1) {
                            id = parts[parts.length - 1].replace(/\/$/, "")
                        }
                    }

                    if (id && title) {
                        comics.push(new Comic({ id, title, cover }))
                    }
                }

                if (comics.length > 0) {
                    result.push({ title: sectionTitle, comics: comics })
                }
            }

            document.dispose()
            return result
        }
    }
]
```

## viewMore 模板

`viewMore` 是探索页每个区块的可选字段，类型为 `PageJumpTarget`，用于点击"更多"按钮时跳转到指定页面。

### 标准格式（推荐）

```javascript
viewMore: {
    page: "category",  // 或 "search"
    attributes: {
        category: "分类名称",
        param: "传递给 categoryComics.load 的参数",
    }
}
```

### 6种常见模式

#### 1. 跳转到分类页（tag 筛选）
最常见的模式，点击"更多"跳转到对应分类页。

```javascript
// 场景：首页区块"热血漫画"的更多按钮指向 /category/rexue
viewMore: {
    page: "category",
    attributes: {
        category: "热血",
        param: "rexue",  // 对应 categoryParams 中的值
    }
}
```

#### 2. 跳转到专题页（theme/id）
某些网站使用专题/主题 ID 而非 tag 名称。

```javascript
// 场景：首页区块"校园青春"的更多按钮指向 /theme?id=xxx
// 需在 categoryComics.load 中支持 theme: 前缀的 param
viewMore: {
    page: "category",
    attributes: {
        category: "校园青春",
        param: "theme:cmigxicdg0008dsopt2563ct3",
    }
}
```

#### 3. 纯排序模式
"抢先更新"、"热门漫画"这类区块，更多按钮是全部漫画按指定排序展示。

```javascript
// 场景："热门漫画"更多按钮指向全部漫画按热度排序
// 需在 categoryComics.load 中支持 sort: 前缀的 param
viewMore: {
    page: "category",
    attributes: {
        category: "全部",
        param: "sort:total",  // sort:latest 或 sort:total
    }
}
```

#### 4. 跳转到搜索结果页
某些"更多"按钮实际是搜索某个关键词。

```javascript
// 场景："3D漫画"更多按钮是搜索 3D 关键词
viewMore: {
    page: "search",
    attributes: {
        keyword: "3D",
    }
}
```

#### 5. 分类 + 指定排序
跳转到某个分类，同时指定排序方式。

```javascript
// 场景："最新日漫"更多按钮指向日漫分类按最新排序
viewMore: {
    page: "category",
    attributes: {
        category: "日漫",
        param: "japanese",
    }
}
// 注：排序由 optionList 控制，如需要固定排序，可在 param 中携带排序信息
```

#### 6. 字符串格式（兼容旧版）
部分旧源码使用字符串格式 `category:名称@param`，新代码不推荐使用。

```javascript
// 旧格式，仅作兼容参考
viewMore: `category:热血@rexue`
```

### 完整示例

```javascript
explore = [
    {
        title: "漫画源名称",
        type: "multiPartPage",
        load: async (page) => {
            let res = await Network.get(this.url)
            // ... 解析页面 ...

            let sections = document.querySelectorAll(".section")
            for (let sec of sections) {
                let title = sec.querySelector(".section-title").text.trim()
                let comics = []
                // ... 解析漫画列表 ...

                // 查找"更多"按钮
                let moreLink = sec.querySelector(".more-btn")
                let viewMore = null
                if (moreLink) {
                    let href = moreLink.attributes["href"] || ""
                    // 根据 href 判断类型，构造 viewMore
                    if (href.includes("/category/")) {
                        let tag = href.split("/category/").pop().replace("/", "")
                        viewMore = {
                            page: "category",
                            attributes: {
                                category: title,
                                param: tag,
                            }
                        }
                    } else if (href.includes("/theme?id=")) {
                        let themeId = href.split("id=").pop()
                        viewMore = {
                            page: "category",
                            attributes: {
                                category: title,
                                param: "theme:" + themeId,
                            }
                        }
                    }
                }

                let part = { title: title, comics: comics }
                if (viewMore) part.viewMore = viewMore
                result.push(part)
            }

            document.dispose()
            return result
        }
    }
]
```

## 分类配置模板

```javascript
category = {
    title: "与name一致",
    parts: [
        {
            name: "分类",
            type: "fixed",
            categories: ["全部", "热血", "仙侠", ...],
            categoryParams: ["", "rexue", "xianxia", ...],
            itemType: "category",
        }
    ],
    enableRankingPage: false,
}
```

## 分类漫画加载模板

```javascript
categoryComics = {
    load: async (category, param, options, page) => {
        let url = this.url + "category"
        if (param && param.length > 0) {
            url = url + "/theme/" + param
        }
        if (page > 1) {
            url = url + "/page/" + page
        }

        let res = await Network.get(url)
        if (res.status !== 200) {
            throw `Invalid status code: ${res.status}`
        }

        let document = new HtmlDocument(res.body)
        let items = document.querySelectorAll(".comic-items .item a")

        let comics = []
        for (let item of items) {
            let href = item.attributes["href"] || ""
            let title = item.querySelector(".title")?.text.trim() || ""
            let cover = item.querySelector("img")?.attributes["data-original"] || ""

            // 提取ID
            let id = ""
            if (href.includes("/manhua/")) {
                let parts = href.split("/manhua/")
                if (parts.length > 1) {
                    id = parts[parts.length - 1].replace(/\/$/, "")
                }
            }

            if (id && title) {
                comics.push(new Comic({ id, title, cover }))
            }
        }

        // 计算 maxPage
        let maxPage = 1
        let pageInfo = document.querySelector(".pages .num")
        if (pageInfo) {
            let match = pageInfo.text.match(/\/(\d+)/)
            if (match) maxPage = parseInt(match[1])
        }

        document.dispose()
        return { comics, maxPage }
    },
}
```

## 搜索页模板

```javascript
search = {
    load: async (keyword, options, page) => {
        let encodedKeyword = encodeURIComponent(keyword)
        let url = this.url + "search?q=" + encodedKeyword
        if (page > 1) {
            url = url + "&page=" + page
        }

        let res = await Network.get(url)
        if (res.status !== 200) {
            throw `Invalid status code: ${res.status}`
        }

        let document = new HtmlDocument(res.body)
        // TODO: 根据实际页面结构调整
        let items = document.querySelectorAll(".comic-item")

        let comics = []
        for (let item of items) {
            let link = item.querySelector("a")
            if (!link) continue

            let href = link.attributes["href"] || ""
            let title = link.querySelector(".title")?.text.trim() || ""
            let cover = link.querySelector("img")?.attributes["src"] || ""

            let id = href.split("/manhua/")[1]?.replace(/\/$/, "") || ""
            if (id && title) {
                comics.push(new Comic({ id, title, cover }))
            }
        }

        document.dispose()
        return { comics, maxPage: 1 }
    },
    enableTagsSuggestions: false,
}
```

## 详情页模板

```javascript
loadInfo: async (id) => {
    let url = this.url + "manhua/" + id
    let res = await Network.get(url)
    if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`
    }

    let document = new HtmlDocument(res.body)

    let title = document.querySelector("h1.title")?.text.trim() || ""
    let cover = document.querySelector(".cover img")?.attributes["src"] || ""
    let description = document.querySelector(".description")?.text.trim() || ""

    // 提取作者（根据实际结构调整）
    let author = ""
    let authorElem = document.querySelector(".author")
    if (authorElem) {
        let text = authorElem.text.trim()
        if (text.startsWith("作者")) {
            author = text.replace(/^作者[：:]\s*/, "").trim()
        }
    }

    // 提取标签
    let tags = []
    let tagItems = document.querySelectorAll(".tags .item")
    for (let item of tagItems) {
        tags.push(item.text.trim())
    }

    // 提取更新时间
    let updateTime = ""
    let timeElem = document.querySelector(".time")
    if (timeElem) {
        let text = timeElem.text.trim()
        if (text.includes("更新")) {
            updateTime = text.replace(/^更新时间[：:]\s*/, "").trim()
        }
    }

    // 提取章节
    let chapters = new Map()
    let chapterItems = document.querySelectorAll(".chapter-list a")
    for (let item of chapterItems) {
        let href = item.attributes["href"] || ""
        let chTitle = item.text.trim()
        let chId = href.split("/").pop()?.replace(".html", "") || ""
        if (chId && chTitle) {
            chapters.set(chId, chTitle)
        }
    }

    document.dispose()

    return new ComicDetails({
        title,
        cover,
        description,
        tags: {
            作者: author ? [author] : [],
            标签: tags,
        },
        chapters,
        updateTime,
    })
}
```

## 章节页模板

```javascript
loadEp: async (comicId, epId) => {
    let url = this.url + "manhua/" + comicId + "/" + epId + ".html"
    let res = await Network.get(url)
    if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`
    }

    let html = res.body
    let images = []

    // 方法1: 从JS变量提取
    let numMatch = html.match(/var\s+num\s*=\s*(\d+)/)
    let pathMatch = html.match(/var\s+pasd\s*=\s*["']([^"']+)["']/)
    if (numMatch && pathMatch) {
        let num = parseInt(numMatch[1])
        let pathPrefix = pathMatch[1]
        for (let i = 1; i <= num; i++) {
            images.push(pathPrefix + i + ".jpg")
        }
    }

    // 方法2: 从DOM提取
    if (images.length === 0) {
        let document = new HtmlDocument(html)
        let imgs = document.querySelectorAll(".images img")
        for (let img of imgs) {
            let src = img.attributes["data-src"] || img.attributes["src"]
            if (src) images.push(src)
        }
        document.dispose()
    }

    if (images.length === 0) {
        throw "未能提取任何图片"
    }

    return { images }
}
```

## Referer 设置模板

```javascript
comic = {
    onImageLoad: (url, comicId, epId) => {
        return {
            headers: {
                "Referer": this.url,
            }
        }
    },
    // ...
}
```

## AES 解密模板（如需解密图片）

```javascript
// 页面中提取加密参数
let paramsMatch = html.match(/var params\s*=\s*'([^']+)'/)
if (paramsMatch) {
    let encryptedParams = paramsMatch[1]
    
    // Base64 解码
    let encryptedBytes = Convert.decodeBase64(encryptedParams)
    
    // 提取 IV 和密文
    let ivBytes = encryptedBytes.slice(0, 16)
    let cipherBytes = encryptedBytes.slice(16)
    
    // AES 解密
    let keyStr = "解密密钥"
    let keyBytes = Convert.encodeUtf8(keyStr)
    let decryptedBytes = Convert.decryptAesCbc(cipherBytes, keyBytes, ivBytes)
    let decryptedText = Convert.decodeUtf8(decryptedBytes)
    let data = JSON.parse(decryptedText)
    
    // 使用解密后的数据
    // data.images_hosts, data.chapter_images 等
}
```
