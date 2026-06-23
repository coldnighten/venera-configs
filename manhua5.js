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
                name: "类型",
                type: "fixed",
                categories: [
                    { label: "全部", target: { page: "category", attributes: { category: "全部", param: "" } } },
                    { label: "少年漫画", target: { page: "category", attributes: { category: "少年漫画", param: "list/1" } } },
                    { label: "少女漫画", target: { page: "category", attributes: { category: "少女漫画", param: "list/2" } } },
                    { label: "青年漫画", target: { page: "category", attributes: { category: "青年漫画", param: "list/3" } } },
                    { label: "少儿漫画", target: { page: "category", attributes: { category: "少儿漫画", param: "list/4" } } },
                ]
            },
            {
                name: "标签",
                type: "fixed",
                categories: [
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
                    { label: "都市", target: { page: "category", attributes: { category: "都市", param: "tags/31" } } },
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
}
