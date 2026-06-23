/** @type {import('./_venera_.js')} */

class Manhua5Source extends ComicSource {
    name = "ManHuaWu"
    key = "manhua5"
    version = "1.0.0"
    minAppVersion = "1.6.0"
    url = "https://www.mhua5.com/"

    explore = [
        {
            title: "ManHuaWu",
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

                let result = {}

                let sections = soup.querySelectorAll('div.in-sec-wr')

                for (let sec of sections) {
                    let title = ''
                    let firstElem = sec.querySelector('h2, h3, strong, span, a')
                    if (firstElem) {
                        title = firstElem.text.trim()
                    }
                    if (!title || title.length < 2) {
                        title = 'Featured'
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
                        result[title] = comics
                    }
                }

                soup.dispose()
                return result
            }
        }
    ]

    category = {
        title: "Categories",
        parts: [
            {
                name: "Tags",
                type: "fixed",
                categories: [
                    { label: "All", target: { page: "category", attributes: { category: "All", param: "" } } },
                    { label: "Hot Blood", target: { page: "category", attributes: { category: "Hot Blood", param: "tags/6" } } },
                    { label: "Adventure", target: { page: "category", attributes: { category: "Adventure", param: "tags/7" } } },
                    { label: "Sci-Fi", target: { page: "category", attributes: { category: "Sci-Fi", param: "tags/8" } } },
                    { label: "CEO", target: { page: "category", attributes: { category: "CEO", param: "tags/9" } } },
                    { label: "Fantasy", target: { page: "category", attributes: { category: "Fantasy", param: "tags/10" } } },
                    { label: "School", target: { page: "category", attributes: { category: "School", param: "tags/11" } } },
                    { label: "Cultivation", target: { page: "category", attributes: { category: "Cultivation", param: "tags/12" } } },
                    { label: "Comedy", target: { page: "category", attributes: { category: "Comedy", param: "tags/13" } } },
                    { label: "Time Travel", target: { page: "category", attributes: { category: "Time Travel", param: "tags/14" } } },
                    { label: "Harem", target: { page: "category", attributes: { category: "Harem", param: "tags/15" } } },
                    { label: "BL", target: { page: "category", attributes: { category: "BL", param: "tags/16" } } },
                    { label: "Romance", target: { page: "category", attributes: { category: "Romance", param: "tags/17" } } },
                    { label: "Mystery", target: { page: "category", attributes: { category: "Mystery", param: "tags/18" } } },
                    { label: "Horror", target: { page: "category", attributes: { category: "Horror", param: "tags/19" } } },
                    { label: "War", target: { page: "category", attributes: { category: "War", param: "tags/20" } } },
                    { label: "Action", target: { page: "category", attributes: { category: "Action", param: "tags/21" } } },
                    { label: "Fan Fiction", target: { page: "category", attributes: { category: "Fan Fiction", param: "tags/22" } } },
                    { label: "Sports", target: { page: "category", attributes: { category: "Sports", param: "tags/23" } } },
                    { label: "Inspirational", target: { page: "category", attributes: { category: "Inspirational", param: "tags/24" } } },
                    { label: "Alternate History", target: { page: "category", attributes: { category: "Alternate History", param: "tags/25" } } },
                    { label: "Supernatural", target: { page: "category", attributes: { category: "Supernatural", param: "tags/26" } } },
                    { label: "GL", target: { page: "category", attributes: { category: "GL", param: "tags/27" } } },
                    { label: "Ancient", target: { page: "category", attributes: { category: "Ancient", param: "tags/28" } } },
                    { label: "Life", target: { page: "category", attributes: { category: "Life", param: "tags/29" } } },
                    { label: "Real Life", target: { page: "category", attributes: { category: "Real Life", param: "tags/30" } } },
                    { label: "City", target: { page: "category", attributes: { category: "City", param: "tags/31" } } },
                    { label: "Daily", target: { page: "category", attributes: { category: "Daily", param: "tags/49" } } },
                    { label: "Pure Love", target: { page: "category", attributes: { category: "Pure Love", param: "tags/51" } } },
                    { label: "Detective", target: { page: "category", attributes: { category: "Detective", param: "tags/52" } } },
                    { label: "Magic", target: { page: "category", attributes: { category: "Magic", param: "tags/53" } } },
                    { label: "Fighting", target: { page: "category", attributes: { category: "Fighting", param: "tags/54" } } },
                    { label: "Female Lead", target: { page: "category", attributes: { category: "Female Lead", param: "tags/55" } } },
                    { label: "Story", target: { page: "category", attributes: { category: "Story", param: "tags/56" } } },
                    { label: "President", target: { page: "category", attributes: { category: "President", param: "tags/57" } } },
                    { label: "Wuxia", target: { page: "category", attributes: { category: "Wuxia", param: "tags/58" } } },
                    { label: "Super Power", target: { page: "category", attributes: { category: "Super Power", param: "tags/59" } } },
                    { label: "Korean", target: { page: "category", attributes: { category: "Korean", param: "tags/61" } } },
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
                label: "Sort",
                options: [
                    "hits-Popular",
                    "addtime-Update Time"
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

            let eps = []
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
                            eps.push({
                                id: chId,
                                title: chTitle
                            })
                        }
                    }
                }
            }

            let updateSpan = soup.querySelector('span.update-time')
            let updateTime = updateSpan ? updateSpan.text.trim() : ''

            soup.dispose()
            return new ComicDetails({
                id: id,
                title: title,
                cover: cover,
                author: author,
                description: description,
                tags: tags,
                status: updateTime,
                updateTime: updateTime,
                chapters: eps,
                isMultiEp: eps.length > 0
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