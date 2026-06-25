/**
 * Venera 漫画源完整模板
 *
 * 注意事项：
 * 1. 使用 new HtmlDocument() 而不是 new Document()
 * 2. chapters 必须是 Map<string, string> 格式
 * 3. tags 必须是对象格式 {作者: [...], 标签: [...]}
 * 4. 探索页和分类页标题必须与 name 一致
 * 5. ComicDetails 只包含有效参数
 * 6. 如需登录/收藏功能，见下方登录模板部分
 */

class ComicSourceTemplate extends ComicSource {
    // ========== 基础信息 ==========
    name = "漫画源名称"
    key = "source_key"
    version = "1.0.0"
    minAppVersion = "1.6.0"
    url = "https://example.com/"

    // ========== 防盗链设置（推荐添加） ==========
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

    // ========== 登录状态检查 ==========
    get isLogged() {
        return this.loadData("source_cookie") !== null
    }

    get cookie() {
        return this.loadData("source_cookie") || ""
    }

    // ========== ID 缓存机制（收藏功能需要） ==========
    get numericIdMap() {
        return this.loadData("source_id_map") || {}
    }

    cacheNumericId(slug, numericId) {
        let map = this.numericIdMap
        map[slug] = numericId
        map[numericId] = slug
        this.saveData("source_id_map", map)
    }

    async ensureNumericId(comicId) {
        // 如果已经是数字，直接返回
        if (/^\d+$/.test(comicId)) {
            return comicId
        }

        // 检查缓存
        let map = this.numericIdMap
        if (map[comicId]) {
            return map[comicId]
        }

        // 缓存没有，请求详情页获取
        let url = `${this.url}/comic/${comicId}`
        let res = await Network.get(url)
        let soup = new HtmlDocument(res.body)

        // 从收藏按钮提取数字 ID（根据实际结构调整选择器）
        let collectBtn = soup.querySelector('a.j-user-collect')
        let numericId = collectBtn ? collectBtn.attributes['data-id'] || '' : ''

        soup.dispose()

        if (numericId && /^\d+$/.test(numericId)) {
            this.cacheNumericId(comicId, numericId)
            return numericId
        }

        throw "无法获取漫画ID"
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

    // ========== 账号相关（登录/注册/注销） ==========
    account = {
        login: async (username, password) => {
            let url = `${this.url}/api/login?name=${encodeURIComponent(username)}&pass=${encodeURIComponent(password)}`
            let res = await Network.get(url)

            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let json = JSON.parse(res.body)
            if (json.code !== 1) {
                throw json.msg || "Login failed"
            }

            // 提取并保存 cookies
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

            if (cookies.length > 0) {
                this.saveData("source_cookie", cookies.join("; "))
            }

            return "ok"
        },

        logout: () => {
            this.deleteData("source_cookie")
        },

        registerWebsite: `${this.url}/register`
    }

    // ========== 收藏功能（可选） ==========
    favorites = {
        multiFolder: false,  // true=支持多文件夹, false=单文件夹

        addOrDelFavorite: async (comicId, folderId, isAdding, favoriteId) => {
            let numericId = await this.ensureNumericId(comicId)
            let url = `${this.url}/api/favadd?did=${numericId}`
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
            let url = `${this.url}/api/fav`
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
        },
    }

    // ========== 探索页面 ==========
    explore = [
        {
            title: "漫画源名称",  // 必须与 name 一致
            type: "multiPartPage",  // 或 singlePageWithMultiPart / multiPageComicList
            load: async (page) => {
                let res = await Network.get(this.url)
                if (res.status !== 200) {
                    throw `Invalid status code: ${res.status}`
                }

                let document = new HtmlDocument(res.body)
                let result = []

                // 多区块处理
                let sections = document.querySelectorAll("section-selector")
                for (let sec of sections) {
                    let title = sec.querySelector("title-selector").text.trim()
                    let comics = []

                    let items = sec.querySelectorAll("comic-item-selector")
                    for (let item of items) {
                        let link = item.querySelector("link-selector")
                        let img = item.querySelector("img-selector")

                        let id = ""
                        let href = link.attributes["href"] || ""
                        // 从链接提取ID

                        comics.push(new Comic({
                            id: id,
                            title: link.text.trim(),
                            cover: img.attributes["src"] || img.attributes["data-src"],
                        }))
                    }

                    if (comics.length > 0) {
                        result.push({ title: title, comics: comics })
                    }
                }

                document.dispose()
                return result
            }
        }
    ]

    // ========== 分类页面 ==========
    category = {
        title: "漫画源名称",  // 必须与 name 一致
        parts: [
            {
                name: "分类",
                type: "fixed",
                categories: ["全部", "分类1", "分类2"],
                categoryParams: ["all", "cat1", "cat2"],
                itemType: "category",
            }
        ],
        enableRankingPage: false,
    }

    // ========== 分类漫画加载 ==========
    categoryComics = {
        load: async (category, param, options, page) => {
            let url = `${this.url}/category/${param}?page=${page}`
            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let document = new HtmlDocument(res.body)
            let items = document.querySelectorAll("comic-item-selector")

            let comics = []
            for (let item of items) {
                // 解析漫画信息...
                comics.push(new Comic({
                    id: id,
                    title: title,
                    cover: cover,
                }))
            }

            let maxPage = 1
            // 计算最大页数...

            document.dispose()
            return {
                comics: comics,
                maxPage: maxPage
            }
        },
        optionList: []
    }

    // ========== 搜索 ==========
    search = {
        load: async (keyword, options, page) => {
            let url = `${this.url}/search?q=${encodeURIComponent(keyword)}&page=${page}`
            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let document = new HtmlDocument(res.body)
            let items = document.querySelectorAll("comic-item-selector")

            let comics = []
            for (let item of items) {
                // 解析漫画信息...
                comics.push(new Comic({
                    id: id,
                    title: title,
                    cover: cover,
                }))
            }

            let maxPage = 1
            // 计算最大页数...

            document.dispose()
            return {
                comics: comics,
                maxPage: maxPage
            }
        },
        enableTagsSuggestions: false,
    }

    // ========== 漫画详情 ==========
    comic = {
        loadInfo: async (id) => {
            let url = `${this.url}/comic/${id}`
            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let document = new HtmlDocument(res.body)

            // 提取基本信息
            let title = document.querySelector("title-selector").text.trim()
            let cover = document.querySelector("cover-selector").attributes["src"]
            let description = document.querySelector("desc-selector").text.trim()

            // 提取作者和标签
            let author = document.querySelector("author-selector").text.trim()
            let tagElements = document.querySelectorAll("tag-selector")
            let tags = []
            for (let t of tagElements) {
                tags.push(t.text.trim())
            }

            // 提取章节 - 必须是 Map 格式！
            let chapters = new Map()
            let chapterItems = document.querySelectorAll("chapter-item-selector")
            for (let item of chapterItems) {
                let link = item.querySelector("a")
                let chId = ""
                let href = link.attributes["href"] || ""
                // 从链接提取章节ID...
                let chTitle = link.text.trim()
                chapters.set(chId, chTitle)
            }

            let updateTime = ""
            // 提取更新时间...

            // ========== 提取并缓存数字 ID（收藏功能需要）==========
            let collectBtn = document.querySelector('a.j-user-collect')
            if (collectBtn) {
                let numericId = collectBtn.attributes['data-id'] || ''
                if (numericId && /^\d+$/.test(numericId)) {
                    this.cacheNumericId(id, numericId)
                }
            }

            document.dispose()

            // 正确的 ComicDetails 格式
            return new ComicDetails({
                title: title,
                cover: cover,
                description: description,
                tags: {
                    作者: author ? [author] : [],
                    标签: tags,
                },
                chapters: chapters,
                updateTime: updateTime,
            })
        },

        loadEp: async (comicId, epId) => {
            let url = `${this.url}/chapter/${epId}`
            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let images = []
            let html = res.body

            // 提取图片URL...
            // 可以用正则或HtmlDocument解析

            // 检查是否为空
            if (images.length === 0) {
                throw "未能提取任何图片"
            }

            return {
                images: images
            }
        }
    }
}
