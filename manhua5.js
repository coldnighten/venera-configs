/** @type {import('./_venera_.js')} */

class Manhua5Source extends ComicSource {
    name = "漫画屋"
    key = "manhua5"
    version = "1.0.0"
    minAppVersion = "1.6.0"
    url = "https://www.mhua5.com/"

    explore = [
        {
            title: "精品推荐",
            type: "multiPartPage",
            load: async (page) => {
                let res = await Network.get(this.url)

                if (res.status !== 200) {
                    throw `Invalid status code: ${res.status}`
                }

                let soup = new Document(res.body)

                function parseComic(elem) {
                    let img = elem.querySelector('img.lazy')
                    let titleElem = elem.querySelector('p.comic__title')
                    let titleLink = titleElem ? titleElem.querySelector('a') : null

                    let id = null
                    if (titleLink) {
                        let href = titleLink.getAttribute('href') || ''
                        let parts = href.split('/comic/')
                        if (parts.length > 1) {
                            id = parts[parts.length - 1]
                        }
                    }

                    let title = titleLink ? titleLink.textContent.trim() : ''
                    let cover = img ? (img.getAttribute('data-original') || img.getAttribute('src')) : ''

                    return new Comic({
                        id: id,
                        title: title,
                        cover: cover,
                    })
                }

                let result = {}

                // 查找所有区块
                let sections = soup.querySelectorAll('div.in-sec-wr')

                for (let sec of sections) {
                    let title = ''
                    let firstElem = sec.querySelector('h2, h3, strong, span, a')
                    if (firstElem) {
                        title = firstElem.textContent.trim()
                    }
                    if (!title || title.length < 2) {
                        title = '精品推荐'
                    }

                    let comics = []

                    // 大推荐漫画
                    let big = sec.querySelector('div.in-fine__big')
                    if (big) {
                        comics.push(parseComic(big))
                    }

                    // Type-A 漫画
                    let typeA = sec.querySelectorAll('div.in-comic--type-a')
                    for (let t of typeA) {
                        comics.push(parseComic(t))
                    }

                    // Type-B 漫画
                    let typeB = sec.querySelectorAll('div.in-comic--type-b')
                    for (let t of typeB) {
                        comics.push(parseComic(t))
                    }

                    if (comics.length > 0) {
                        result[title] = comics
                    }
                }

                return result
            }
        }
    ]

    category = {
        title: "漫画分类",
        parts: [
            {
                name: "标签",
                type: "fixed",
                categories: [
                    { label: "全部", target: { page: "category", attributes: { category: "全部", param: "" } } },
                    { label: "热血", target: { page: "category", attributes: { category: "热血", param: "tags/6" } } },
                    { label: "冒险", target: { page: "category", attributes: { category: "冒险", param: "tags/7" } } },
                    { label: "科幻", target: { page: "category", attributes: { category: "科幻", param: "tags/8" } } },
                    { label: "霸总", target: { page: "category", attributes: { category: "霸总", param: "tags/9" } } },
                    { label: "玄幻", target: { page: "category", attributes: { category: "玄幻", param: "tags/10" } } },
                    { label: "校园", target: { page: "category", attributes: { category: "校园", param: "tags/11" } } },
                    { label: "修真", target: { page: "category", attributes: { category: "修真", param: "tags/12" } } },
                    { label: "搞笑", target: { page: "category", attributes: { category: "搞笑", param: "tags/13" } } },
                    { label: "穿越", target: { page: "category", attributes: { category: "穿越", param: "tags/14" } } },
                    { label: "后宫", target: { page: "category", attributes: { category: "后宫", param: "tags/15" } } },
                    { label: "耽美", target: { page: "category", attributes: { category: "耽美", param: "tags/16" } } },
                    { label: "恋爱", target: { page: "category", attributes: { category: "恋爱", param: "tags/17" } } },
                    { label: "悬疑", target: { page: "category", attributes: { category: "悬疑", param: "tags/18" } } },
                    { label: "恐怖", target: { page: "category", attributes: { category: "恐怖", param: "tags/19" } } },
                    { label: "战争", target: { page: "category", attributes: { category: "战争", param: "tags/20" } } },
                    { label: "动作", target: { page: "category", attributes: { category: "动作", param: "tags/21" } } },
                    { label: "同人", target: { page: "category", attributes: { category: "同人", param: "tags/22" } } },
                    { label: "竞技", target: { page: "category", attributes: { category: "竞技", param: "tags/23" } } },
                    { label: "励志", target: { page: "category", attributes: { category: "励志", param: "tags/24" } } },
                    { label: "架空", target: { page: "category", attributes: { category: "架空", param: "tags/25" } } },
                    { label: "灵异", target: { page: "category", attributes: { category: "灵异", param: "tags/26" } } },
                    { label: "百合", target: { page: "category", attributes: { category: "百合", param: "tags/27" } } },
                    { label: "古风", target: { page: "category", attributes: { category: "古风", param: "tags/28" } } },
                    { label: "生活", target: { page: "category", attributes: { category: "生活", param: "tags/29" } } },
                    { label: "真人", target: { page: "category", attributes: { category: "真人", param: "tags/30" } } },
                    { label: "都市", target: { page: "category", attributes: { category: "都市", param: "tags/31" } } },
                    { label: "日常", target: { page: "category", attributes: { category: "日常", param: "tags/49" } } },
                    { label: "纯爱", target: { page: "category", attributes: { category: "纯爱", param: "tags/51" } } },
                    { label: "推理", target: { page: "category", attributes: { category: "推理", param: "tags/52" } } },
                    { label: "奇幻", target: { page: "category", attributes: { category: "奇幻", param: "tags/53" } } },
                    { label: "格斗", target: { page: "category", attributes: { category: "格斗", param: "tags/54" } } },
                    { label: "大女主", target: { page: "category", attributes: { category: "大女主", param: "tags/55" } } },
                    { label: "剧情", target: { page: "category", attributes: { category: "剧情", param: "tags/56" } } },
                    { label: "总裁", target: { page: "category", attributes: { category: "总裁", param: "tags/57" } } },
                    { label: "武侠", target: { page: "category", attributes: { category: "武侠", param: "tags/58" } } },
                    { label: "异能", target: { page: "category", attributes: { category: "异能", param: "tags/59" } } },
                    { label: "韩漫", target: { page: "category", attributes: { category: "韩漫", param: "tags/61" } } },
                ]
            }
        ],
        enableRankingPage: false,
    }

    categoryComics = {
        load: async (category, param, options, page) => {
            // 构造URL
            let baseUrl = "https://www.mhua5.com/index.php/category/"
            let url = ""

            if (param && param.length > 0) {
                // param 形如 "list/1" 或 "tags/6"
                url = baseUrl + param + "/"
            } else {
                // 全部 - 使用排序
                let order = options && options[0] ? options[0] : "hits"
                url = baseUrl + "order/" + order + "/"
            }

            if (page > 1) {
                url = url + "page/" + page
            }

            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let soup = new Document(res.body)
            let items = soup.querySelectorAll('div.common-comic-item')

            let comics = []
            for (let item of items) {
                let img = item.querySelector('img.lazy')
                let titleLink = item.querySelector('p.comic__title a')

                let id = null
                if (titleLink) {
                    let href = titleLink.getAttribute('href') || ''
                    let parts = href.split('/comic/')
                    if (parts.length > 1) {
                        id = parts[parts.length - 1]
                    }
                }

                let title = titleLink ? titleLink.textContent.trim() : ''
                let cover = img ? (img.getAttribute('data-original') || img.getAttribute('src')) : ''

                if (id && title) {
                    comics.push(new Comic({
                        id: id,
                        title: title,
                        cover: cover,
                    }))
                }
            }

            // 获取最大页数
            let maxPage = 1
            let allLinks = soup.querySelectorAll('a')
            for (let link of allLinks) {
                let href = link.getAttribute('href') || ''
                let text = link.textContent.trim()
                if (href.includes('/page/') && /^\d+$/.test(text)) {
                    let num = parseInt(text)
                    if (num > maxPage) {
                        maxPage = num
                    }
                }
            }

            return {
                comics: comics,
                maxPage: maxPage
            }
        },
        optionList: [
            {
                label: "排序",
                options: [
                    "hits-热门人气",
                    "addtime-更新时间"
                ],
            }
        ]
    }

    search = {
        load: async (keyword, options, page) => {
            // 构造搜索URL
            let url = `https://www.mhua5.com/index.php/search?key=${encodeURIComponent(keyword)}`
            if (page > 1) {
                url = url + `&page=${page}`
            }

            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let soup = new Document(res.body)
            let items = soup.querySelectorAll('div.common-comic-item')

            let comics = []
            for (let item of items) {
                let img = item.querySelector('img.lazy')
                let titleLink = item.querySelector('p.comic__title a')

                let id = null
                if (titleLink) {
                    let href = titleLink.getAttribute('href') || ''
                    let parts = href.split('/comic/')
                    if (parts.length > 1) {
                        id = parts[parts.length - 1]
                    }
                }

                let title = titleLink ? titleLink.textContent.trim() : ''
                let cover = img ? (img.getAttribute('data-original') || img.getAttribute('src')) : ''

                if (id && title) {
                    comics.push(new Comic({
                        id: id,
                        title: title,
                        cover: cover,
                    }))
                }
            }

            // 获取最大页数
            let maxPage = 1
            let allLinks = soup.querySelectorAll('a')
            for (let link of allLinks) {
                let href = link.getAttribute('href') || ''
                let text = link.textContent.trim()
                if (href.includes('/search') && text.isdigit()) {
                    let num = parseInt(text)
                    if (num > maxPage) {
                        maxPage = num
                    }
                }
            }

            return {
                comics: comics,
                maxPage: maxPage
            }
        },
        enableTagsSuggestions: false,
    }

    comic = {
        loadInfo: async (id) => {
            let url = `https://www.mhua5.com/index.php/comic/${id}`
            let res = await Network.get(url)

            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let soup = new Document(res.body)

            // 封面
            let coverImg = soup.querySelector('div.de-info__cover img')
            let cover = coverImg ? (coverImg.getAttribute('src') || coverImg.getAttribute('data-original')) : ''

            // 标题
            let titleElem = soup.querySelector('p.comic-title')
            let title = titleElem ? titleElem.textContent.trim() : ''

            // 作者
            let authorElem = soup.querySelector('div.comic-author span.name a')
            let author = authorElem ? authorElem.textContent.trim() : ''

            // 简介
            let introElem = soup.querySelector('p.intro-total')
            let description = introElem ? introElem.textContent.trim() : ''

            // 标签
            let tags = []
            let tagLinks = soup.querySelectorAll('div.comic-status a')
            for (let link of tagLinks) {
                let href = link.getAttribute('href') || ''
                if (href.includes('/category/tags/')) {
                    tags.push(link.textContent.trim())
                }
            }

            // 状态信息
            let statusDiv = soup.querySelector('div.comic-status')
            let statusTexts = statusDiv ? statusDiv.querySelectorAll('span.text') : []

            // 解析人气
            let popularity = ''
            for (let s of statusTexts) {
                let text = s.textContent.trim()
                if (text.includes('人气')) {
                    popularity = text.replace('人气:', '').trim()
                }
            }

            // 章节列表
            let eps = []
            let chapterList = soup.querySelector('ul.chapter__list-box')
            if (chapterList) {
                let items = chapterList.querySelectorAll('li.chapter__item')
                for (let item of items) {
                    let link = item.querySelector('a.j-chapter-link')
                    if (link) {
                        let href = link.getAttribute('href') || ''
                        let chId = ''
                        if (href.includes('/chapter/')) {
                            chId = href.split('/chapter/')[1]
                        }
                        let chTitle = link.textContent.trim()
                        if (chId && chTitle) {
                            eps.push({
                                id: chId,
                                title: chTitle
                            })
                        }
                    }
                }
            }

            // 最新章节
            let updateSpan = soup.querySelector('span.update-time')
            let updateTime = updateSpan ? updateSpan.textContent.trim() : ''

            return new ComicDetails({
                id: id,
                title: title,
                cover: cover,
                author: author,
                description: description,
                tags: tags,
                status: updateTime,
                updateTime: updateTime,
                eps: eps,
                isMultiEp: eps.length > 0
            })
        },

        loadEp: async (comicId, epId) => {
            let url = `https://www.mhua5.com/index.php/chapter/${epId}`
            let res = await Network.get(url)

            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let soup = new Document(res.body)

            // 查找图片列表
            // 图片可能在 script 标签中或特定的容器中
            let images = []

            // 尝试从页面中提取图片URL
            // 查找所有图片元素
            let imgElements = soup.querySelectorAll('img')
            for (let img of imgElements) {
                let src = img.getAttribute('src') || img.getAttribute('data-original') || img.getAttribute('data-src')
                if (src && (src.includes('mkzcdn') || src.includes('baozimh') || src.includes('comic'))) {
                    images.push(src)
                }
            }

            // 如果没找到，尝试从 script 中解析
            if (images.length === 0) {
                let scripts = soup.querySelectorAll('script')
                for (let script of scripts) {
                    let content = script.textContent || ''
                    // 查找图片数组
                    if (content.includes('images') || content.includes('imgList') || content.includes('chapterImages')) {
                        // 尝试匹配图片URL
                        let matches = content.match(/https?:\/\/[^\s"'`]+(?:mkzcdn|baozimh)[^\s"'`]+/g)
                        if (matches) {
                            for (let m of matches) {
                                if (!images.includes(m)) {
                                    images.push(m)
                                }
                            }
                        }
                    }
                }
            }

            return {
                images: images
            }
        }
    }
}
