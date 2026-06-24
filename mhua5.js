/** @type {import('./_venera_.js')} */

class Manhua5Source extends ComicSource {
    name = "漫画屋"
    key = "mhua5"
    version = "1.0.0"
    minAppVersion = "1.6.0"
    url = "https://www.mhua5.com/"

    explore = [
        {
            title: "漫画屋",
            type: "multiPartPage",
            load: async (page) => {
                let res = await Network.get(this.url)

                if (res.status !== 200) {
                    throw `Invalid status code: ${res.status}`
                }

                let soup = new HtmlDocument(res.body)

                function parseComic(elem) {
                    let img = elem.querySelector('img.lazy')
                    let titleElem = elem.querySelector('p.comic__title')
                    let titleLink = titleElem ? titleElem.querySelector('a') : null

                    let id = null
                    if (titleLink) {
                        let href = titleLink.attributes['href'] || ''
                        let parts = href.split('/comic/')
                        if (parts.length > 1) {
                            id = parts[parts.length - 1]
                        }
                    }

                    let title = titleLink ? titleLink.text.trim() : ''
                    let cover = img ? (img.attributes['data-original'] || img.attributes['src']) : ''

                    return new Comic({
                        id: id,
                        title: title,
                        cover: cover,
                    })
                }

                let result = []

                let sections = soup.querySelectorAll('div.in-sec-wr')

                for (let sec of sections) {
                    let sectionTitle = ''
                    let firstElem = sec.querySelector('h2, h3, strong, span, a')
                    if (firstElem) {
                        sectionTitle = firstElem.text.trim()
                    }
                    if (!sectionTitle || sectionTitle.length < 2) {
                        sectionTitle = '精品推荐'
                    }

                    let comics = []

                    let big = sec.querySelector('div.in-fine__big')
                    if (big) {
                        comics.push(parseComic(big))
                    }

                    let typeA = sec.querySelectorAll('div.in-comic--type-a')
                    for (let t of typeA) {
                        comics.push(parseComic(t))
                    }

                    let typeB = sec.querySelectorAll('div.in-comic--type-b')
                    for (let t of typeB) {
                        comics.push(parseComic(t))
                    }

                    if (comics.length > 0) {
                        result.push({title: sectionTitle, comics: comics})
                    }
                }

                soup.dispose()
                return result
            }
        }
    ]

    category = {
        title: "漫画屋",
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
            let baseUrl = "https://www.mhua5.com/index.php/category/"
            let url = ""

            if (param && param.length > 0) {
                url = baseUrl + param + "/"
            } else {
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

            let soup = new HtmlDocument(res.body)
            let items = soup.querySelectorAll('div.common-comic-item')

            let comics = []
            for (let item of items) {
                let img = item.querySelector('img.lazy')
                let titleLink = item.querySelector('p.comic__title a')

                let id = null
                if (titleLink) {
                    let href = titleLink.attributes['href'] || ''
                    let parts = href.split('/comic/')
                    if (parts.length > 1) {
                        id = parts[parts.length - 1]
                    }
                }

                let title = titleLink ? titleLink.text.trim() : ''
                let cover = img ? (img.attributes['data-original'] || img.attributes['src']) : ''

                if (id && title) {
                    comics.push(new Comic({
                        id: id,
                        title: title,
                        cover: cover,
                    }))
                }
            }

            let maxPage = 1
            let allLinks = soup.querySelectorAll('a')
            for (let link of allLinks) {
                let href = link.attributes['href'] || ''
                let text = link.text.trim()
                if (href.includes('/page/') && /^\d+$/.test(text)) {
                    let num = parseInt(text)
                    if (num > maxPage) {
                        maxPage = num
                    }
                }
            }

            soup.dispose()
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
            let url = `https://www.mhua5.com/index.php/search?key=${encodeURIComponent(keyword)}`
            if (page > 1) {
                url = url + `&page=${page}`
            }

            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let soup = new HtmlDocument(res.body)
            let items = soup.querySelectorAll('div.common-comic-item')

            let comics = []
            for (let item of items) {
                let img = item.querySelector('img.lazy')
                let titleLink = item.querySelector('p.comic__title a')

                let id = null
                if (titleLink) {
                    let href = titleLink.attributes['href'] || ''
                    let parts = href.split('/comic/')
                    if (parts.length > 1) {
                        id = parts[parts.length - 1]
                    }
                }

                let title = titleLink ? titleLink.text.trim() : ''
                let cover = img ? (img.attributes['data-original'] || img.attributes['src']) : ''

                if (id && title) {
                    comics.push(new Comic({
                        id: id,
                        title: title,
                        cover: cover,
                    }))
                }
            }

            let maxPage = 1
            let allLinks = soup.querySelectorAll('a')
            for (let link of allLinks) {
                let href = link.attributes['href'] || ''
                let text = link.text.trim()
                if (href.includes('/search') && /^\d+$/.test(text)) {
                    let num = parseInt(text)
                    if (num > maxPage) {
                        maxPage = num
                    }
                }
            }

            soup.dispose()
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

            let soup = new HtmlDocument(res.body)

            let coverImg = soup.querySelector('div.de-info__cover img')
            let cover = coverImg ? (coverImg.attributes['src'] || coverImg.attributes['data-original']) : ''

            let titleElem = soup.querySelector('p.comic-title')
            let title = titleElem ? titleElem.text.trim() : ''

            let authorElem = soup.querySelector('div.comic-author span.name a')
            let author = authorElem ? authorElem.text.trim() : ''

            let introElem = soup.querySelector('p.intro-total')
            let description = introElem ? introElem.text.trim() : ''

            let tags = []
            let tagLinks = soup.querySelectorAll('div.comic-status a')
            for (let link of tagLinks) {
                let href = link.attributes['href'] || ''
                if (href.includes('/category/tags/')) {
                    tags.push(link.text.trim())
                }
            }

            let eps = new Map()
            let chapterList = soup.querySelector('ul.chapter__list-box')
            if (chapterList) {
                let items = chapterList.querySelectorAll('li.chapter__item')
                for (let item of items) {
                    let link = item.querySelector('a.j-chapter-link')
                    if (link) {
                        let href = link.attributes['href'] || ''
                        let chId = ''
                        if (href.includes('/chapter/')) {
                            chId = href.split('/chapter/')[1]
                        }
                        let chTitle = link.text.trim()
                        if (chId && chTitle) {
                            eps.set(chId, chTitle)
                        }
                    }
                }
            }

            let updateSpan = soup.querySelector('span.update-time')
            let updateTime = updateSpan ? updateSpan.text.trim() : ''

            soup.dispose()
            return new ComicDetails({
                title: title,
                cover: cover,
                description: description,
                tags: {
                    作者: author ? [author] : [],
                    标签: tags,
                },
                chapters: eps,
                updateTime: updateTime,
            })
        },

        loadEp: async (comicId, epId) => {
            let url = `https://www.mhua5.com/index.php/chapter/${epId}`
            let res = await Network.get(url)

            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let html = res.body
            let images = []

            let pattern = /https?:\/\/[^\s"'<>]+\.(jpg|png|webp)[^\s"'<>]*/gi
            let matches = html.match(pattern)

            if (matches) {
                for (let m of matches) {
                    if ((m.includes('baozimh.com') || m.includes('mkzcdn.com') || m.includes('mhua5.com')) &&
                        !m.includes('/cover') &&
                        !m.includes('/template') &&
                        images.indexOf(m) === -1) {
                        images.push(m)
                    }
                }
            }

            return {
                images: images
            }
        }
    }
}
