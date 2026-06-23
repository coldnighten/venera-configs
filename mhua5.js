/** @type {import('./_venera_.js')} */

class Mhua5Comic extends ComicSource {
    name = "Mhua5漫画"
    key = "mhua5"
    version = "1.0.0"
    minAppVersion = "1.6.0"
    url = "https://www.mhua5.com/"
    enabled = true

    // 分类配置
    category = {
        title: "分类",
        parts: [
            {
                name: "分类",
                type: "fixed",
                categories: [
                    { label: "全部", target: { page: "category", attributes: { category: "" } } },
                    { label: "少年", target: { page: "category", attributes: { category: "shaonian" } } },
                    { label: "少女", target: { page: "category", attributes: { category: "shaonv" } } },
                    { label: "格斗", target: { page: "category", attributes: { category: "gedou" } } },
                    { label: "科幻", target: { page: "category", attributes: { category: "kehuan" } } },
                    { label: "魔幻", target: { page: "category", attributes: { category: "mohuan" } } },
                    { label: "搞笑", target: { page: "category", attributes: { category: "gaoxiao" } } },
                    { label: "恋爱", target: { page: "category", attributes: { category: "lianai" } } },
                    { label: "生活", target: { page: "category", attributes: { category: "shenghuo" } } },
                    { label: "校园", target: { page: "category", attributes: { category: "xiaoyuan" } } },
                ]
            }
        ]
    }

    // 分类列表加载
    categoryPage = {
        load: async (page, category) => {
            let url = `https://www.mhua5.com/index.php/category/${category || ""}?page=${page}`
            let res = await Network.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Referer": "https://www.mhua5.com/"
                }
            })
            if (res.status !== 200) throw `请求失败: ${res.status}`
            let document = new HtmlDocument(res.body)
            let comics = []
            document.querySelectorAll("li.comic-item, .update-list li, .comic-list-item").forEach(el => {
                let a = el.querySelector("a")
                let img = el.querySelector("img")
                let titleEl = el.querySelector("a") || el.querySelector("h3, .title, p")
                if (a) {
                    let href = a.getAttribute("href") || ""
                    let id = href
                    if (href && !href.startsWith("http")) {
                        id = href.replace(/^.*\/comic\//, "").replace(/\/$/, "")
                    }
                    comics.push(new Comic({
                        id: id,
                        title: titleEl ? titleEl.text.trim() : "",
                        cover: img ? (img.getAttribute("data-src") || img.getAttribute("src") || "") : ""
                    }))
                }
            })
            return { comics: comics, maxPage: 50 }
        }
    }

    // 发现页配置
    explore = [
        {
            title: "最新更新",
            type: "multiPartPage",
            load: async (page) => {
                let res = await Network.get("https://www.mhua5.com/", {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        "Referer": "https://www.mhua5.com/"
                    }
                })
                if (res.status !== 200) throw `请求失败: ${res.status}`
                let document = new HtmlDocument(res.body)
                let comics = []
                document.querySelectorAll("li.comic-item, .update-list li, .comic-list-item").forEach(el => {
                    let a = el.querySelector("a")
                    let img = el.querySelector("img")
                    let titleEl = el.querySelector("a") || el.querySelector("h3, .title, p")
                    if (a) {
                        let href = a.getAttribute("href") || ""
                        let id = href
                        if (href && !href.startsWith("http")) {
                            id = href.replace(/^.*\/comic\//, "").replace(/\/$/, "")
                        }
                        comics.push(new Comic({
                            id: id,
                            title: titleEl ? titleEl.text.trim() : "",
                            cover: img ? (img.getAttribute("data-src") || img.getAttribute("src") || "") : ""
                        }))
                    }
                })
                return { recommend: comics }
            }
        }
    ]

    // 搜索配置
    search = {
        load: async (keyword, options, page) => {
            let url = `https://www.mhua5.com/index.php/search?key=${encodeURIComponent(keyword)}&page=${page}`
            let res = await Network.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Referer": "https://www.mhua5.com/"
                }
            })
            if (res.status !== 200) throw `请求失败: ${res.status}`
            let document = new HtmlDocument(res.body)
            let comics = []
            document.querySelectorAll("li.comic-item, .update-list li, .comic-list-item, .search-result li").forEach(el => {
                let a = el.querySelector("a")
                let img = el.querySelector("img")
                let titleEl = el.querySelector("a") || el.querySelector("h3, .title, p")
                if (a) {
                    let href = a.getAttribute("href") || ""
                    let id = href
                    if (href && !href.startsWith("http")) {
                        id = href.replace(/^.*\/comic\//, "").replace(/\/$/, "")
                    }
                    comics.push(new Comic({
                        id: id,
                        title: titleEl ? titleEl.text.trim() : "",
                        cover: img ? (img.getAttribute("data-src") || img.getAttribute("src") || "") : ""
                    }))
                }
            })
            return { comics: comics, maxPage: 10 }
        }
    }

    // 漫画详情与章节
    comic = {
        loadInfo: async (id) => {
            let url = id.startsWith("http") ? id : `https://www.mhua5.com/index.php/comic/${id}`
            let res = await Network.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Referer": "https://www.mhua5.com/"
                }
            })
            if (res.status !== 200) throw `请求失败: ${res.status}`
            let document = new HtmlDocument(res.body)

            // 提取标题
            let title = ""
            let titleEl = document.querySelector(".comic-info .title h1, .comic-info h1, .info h1, h1.comic-title, h1")
            if (titleEl) title = titleEl.text.trim()

            // 提取封面
            let cover = ""
            let coverEl = document.querySelector(".comic-info img, .cover img, .comic-cover img, .info img")
            if (coverEl) cover = coverEl.getAttribute("data-src") || coverEl.getAttribute("src") || ""

            // 提取作者
            let author = ""
            let authorEl = document.querySelector(".comic-info .author, .author, .comic-author, p:contains('作者')")
            if (authorEl) {
                author = authorEl.text.replace(/作者[::]?\s*/i, "").trim()
            }

            // 提取描述
            let description = ""
            let descEl = document.querySelector(".comic-info .intro, .intro, .description, .comic-desc, .summary")
            if (descEl) description = descEl.text.trim()

            // 提取章节列表
            let chapters = []
            document.querySelectorAll(".chapter-list a, .chapter-item a, ul.chapters li a, .episode-list a, .comic-chapters a").forEach(el => {
                let href = el.getAttribute("href") || ""
                let chapterTitle = el.text.trim()
                let chapterId = href
                if (href && !href.startsWith("http")) {
                    chapterId = href.replace(/^.*\/chapter\//, "").replace(/\/$/, "")
                }
                if (chapterId && chapterTitle) {
                    chapters.push(new Chapter({
                        id: chapterId,
                        title: chapterTitle
                    }))
                }
            })

            return new ComicDetails({
                id: id,
                title: title,
                cover: cover,
                author: author,
                description: description,
                chapters: chapters.reverse()
            })
        },

        // 加载章节图片
        loadEp: async (comicId, epId) => {
            let url = epId.startsWith("http") ? epId : `https://www.mhua5.com/index.php/chapter/${epId}`
            let res = await Network.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Referer": `https://www.mhua5.com/index.php/comic/${comicId}`
                }
            })
            if (res.status !== 200) throw `请求失败: ${res.status}`
            let document = new HtmlDocument(res.body)
            let images = []
            document.querySelectorAll(".comic-content img, .chapter-content img, .reading-content img, .comic-images img, .content img, #content img, img[data-src], img.lazy").forEach(el => {
                let src = el.getAttribute("data-src") || el.getAttribute("data-original") || el.getAttribute("src") || ""
                if (src && !src.includes("logo") && !src.includes("placeholder")) {
                    images.push(src)
                }
            })
            return { images: images }
        }
    }
}
