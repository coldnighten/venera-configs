/**
 * Venera 漫画源标准模板
 * 
 * 注意事项：
 * 1. 使用 new HtmlDocument() 而不是 new Document()
 * 2. chapters 必须是 Map<string, string> 格式
 * 3. tags 必须是对象格式 {作者: [...], 标签: [...]}
 * 4. 探索页和分类页标题必须与 name 一致
 * 5. ComicDetails 只包含有效参数
 */

class ComicSourceTemplate extends ComicSource {
    // 基础信息
    name = "漫画源名称"
    key = "source_key"
    version = "1.0.0"
    minAppVersion = "1.6.0"
    url = "https://example.com/"

    // 探索页面
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

    // 分类页面
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

    // 分类漫画加载
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

    // 搜索
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

    // 漫画详情
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

            return {
                images: images
            }
        }
    }
}
