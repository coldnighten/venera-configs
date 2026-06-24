# 代码模板参考

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
