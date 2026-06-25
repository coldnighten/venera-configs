class RoumSource extends ComicSource {
    name = "肉漫画"
    key = "roum"
    version = "1.0.0"
    minAppVersion = "1.6.0"
    url = "https://m.roumanhua.net/"

    parseComicsFromHtml(html) {
        let document = new HtmlDocument(html)
        let comics = []
        let seen = new Set()

        let links = document.querySelectorAll('a[href^="/catalog/"]')
        for (let link of links) {
            let href = link.attributes["href"] || ""
            let idMatch = href.match(/\/catalog\/(\d+)/)
            if (!idMatch) continue

            let id = idMatch[1]
            if (seen.has(id)) continue
            seen.add(id)

            let img = link.querySelector('img')
            if (!img) continue

            let cover = img.attributes["data-original"] || img.attributes["data-src"] || img.attributes["src"] || ""
            let title = img.attributes["alt"] || img.attributes["title"] || ""

            if (!title) {
                let titleEl = link.querySelector('.title, .name')
                if (titleEl) {
                    title = titleEl.text.trim()
                }
            }

            if (cover.startsWith('//')) {
                cover = 'https:' + cover
            }

            if (id && title && cover) {
                comics.push(new Comic({
                    id: id,
                    title: title,
                    cover: cover,
                }))
            }
        }

        document.dispose()
        return comics
    }

    explore = [
        {
            title: "肉漫画",
            type: "multiPartPage",
            load: async (page) => {
                let res = await Network.get(this.url)
                if (res.status !== 200) {
                    throw `Invalid status code: ${res.status}`
                }

                let html = res.body
                let document = new HtmlDocument(html)
                let result = []

                let sectionTitles = ["最近更新", "最多点击", "完结作品"]
                let sectionIds = ["h1", "h2", "h3"]

                for (let s = 0; s < sectionTitles.length; s++) {
                    let sectionTitle = sectionTitles[s]

                    let titleIdx = html.indexOf(sectionTitle)
                    if (titleIdx < 0) continue

                    let nextTitleIdx = html.length
                    for (let j = s + 1; j < sectionTitles.length; j++) {
                        let idx = html.indexOf(sectionTitles[j], titleIdx + 1)
                        if (idx > titleIdx && idx < nextTitleIdx) {
                            nextTitleIdx = idx
                        }
                    }

                    let sectionHtml = html.substring(titleIdx, nextTitleIdx)
                    let sectionDoc = new HtmlDocument(sectionHtml)
                    let sectionComics = []
                    let seen = new Set()

                    let links = sectionDoc.querySelectorAll('a[href^="/catalog/"]')
                    for (let link of links) {
                        let href = link.attributes["href"] || ""
                        let idMatch = href.match(/\/catalog\/(\d+)/)
                        if (!idMatch) continue

                        let id = idMatch[1]
                        if (seen.has(id)) continue
                        seen.add(id)

                        let img = link.querySelector('img')
                        if (!img) continue

                        let cover = img.attributes["data-original"] || img.attributes["data-src"] || img.attributes["src"] || ""
                        let title = img.attributes["alt"] || img.attributes["title"] || ""

                        if (cover.startsWith('//')) {
                            cover = 'https:' + cover
                        }

                        if (title && cover) {
                            sectionComics.push(new Comic({
                                id: id,
                                title: title,
                                cover: cover,
                            }))
                        }
                    }

                    sectionDoc.dispose()

                    if (sectionComics.length > 0) {
                        let part = {
                            title: sectionTitle,
                            comics: sectionComics,
                            viewMore: {
                                page: "category",
                                attributes: {
                                    category: sectionTitle,
                                    param: sectionTitle === "最近更新" ? "new" : (sectionTitle === "最多点击" ? "hot" : "end"),
                                }
                            }
                        }
                        result.push(part)
                    }
                }

                if (result.length === 0) {
                    let comics = this.parseComicsFromHtml(html)
                    if (comics.length > 0) {
                        result.push({ title: "热门漫画", comics: comics.slice(0, 20) })
                    }
                }

                document.dispose()
                return result
            }
        }
    ]

    category = {
        title: "肉漫画",
        parts: [
            {
                name: "分类",
                type: "fixed",
                categories: ["全部", "剧情", "恋爱", "恐怖", "都市", "异能", "福利", "言情", "悬疑", "伦理", "少年", "玄幻", "校园", "青春", "韩漫"],
                categoryParams: ["all", "juqing", "lianai", "kongbu", "dushi", "yineng", "fuli", "yanqing", "xuanyi", "lunli", "shaonian", "xuanhuan", "xiaoyuan", "qingchun", "hanman"],
                itemType: "category",
            }
        ],
        enableRankingPage: false,
    }

    categoryComics = {
        load: async (category, param, options, page) => {
            let url
            if (param === "all" || param === "") {
                url = this.url + "waplist"
            } else if (param === "new" || param === "hot" || param === "end") {
                url = this.url + "waplist/" + param
            } else {
                url = this.url + "waplist/" + param
            }

            if (page > 1) {
                url += "/" + page
            }

            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let comics = this.parseComicsFromHtml(res.body)

            return {
                comics: comics,
                maxPage: 10
            }
        },
        optionList: []
    }

    search = {
        load: async (keyword, options, page) => {
            let url = this.url + "wapsearch?keyword=" + encodeURIComponent(keyword)
            if (page > 1) {
                url += "&page=" + page
            }

            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let comics = this.parseComicsFromHtml(res.body)

            return {
                comics: comics,
                maxPage: 5
            }
        },
        enableTagsSuggestions: false,
    }

    comic = {
        loadInfo: async (id) => {
            let url = this.url + "catalog/" + id
            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let html = res.body
            let document = new HtmlDocument(html)

            let title = ""
            let h1 = document.querySelector('h1')
            if (h1) {
                title = h1.text.trim()
            }

            let cover = ""
            let coverImg = document.querySelector('img[src*="cover"], img[class*="cover"], img[src*="pic.roumh"]')
            if (coverImg) {
                cover = coverImg.attributes["src"] || coverImg.attributes["data-original"] || ""
            }
            if (!cover) {
                let allImgs = document.querySelectorAll('img')
                for (let img of allImgs) {
                    let src = img.attributes["src"] || ""
                    let dataSrc = img.attributes["data-original"] || img.attributes["data-src"] || ""
                    let realSrc = dataSrc || src
                    if (realSrc && realSrc.indexOf('pic.roumh') >= 0 && realSrc.indexOf('banner') < 0) {
                        cover = realSrc
                        break
                    }
                }
            }

            if (cover.startsWith('//')) {
                cover = 'https:' + cover
            }

            let desc = ""
            let descMatch = html.match(/[\u7B80\u4ECB][\uFF1A:]\s*<[^>]*>([^<]+)</)
            if (descMatch) {
                desc = descMatch[1].trim()
            }
            if (!desc) {
                descMatch = html.match(/[\u7B80\u4ECB][\uFF1A:]\s*([^<\n]+)/)
                if (descMatch) {
                    desc = descMatch[1].trim()
                }
            }

            let author = ""
            let authorMatch = html.match(/[\u4F5C\u8005][\uFF1A:]\s*<[^>]*>([^<]+)</)
            if (authorMatch) {
                author = authorMatch[1].trim()
            }
            if (!author) {
                authorMatch = html.match(/[\u4F5C\u8005][\uFF1A:]\s*([^<\n]+)/)
                if (authorMatch) {
                    author = authorMatch[1].trim()
                }
            }

            let status = ""
            let statusMatch = html.match(/[\u72B6\u6001][\uFF1A:]\s*<[^>]*>([^<]+)</)
            if (statusMatch) {
                status = statusMatch[1].trim()
            }

            let tags = {
                "\u4F5C\u8005": author ? [author] : [],
                "\u72B6\u6001": status ? [status] : [],
            }

            let chapters = new Map()
            let chapterLinks = document.querySelectorAll('a[href^="/wapchapter/"]')
            let seen = new Set()

            for (let link of chapterLinks) {
                let href = link.attributes["href"] || ""
                let epMatch = href.match(/\/wapchapter\/(\d+)/)
                if (!epMatch) continue

                let epId = epMatch[1]
                if (seen.has(epId)) continue
                seen.add(epId)

                let epTitle = link.text.trim()
                if (epTitle && epTitle.charAt(0) === '\u7B2C') {
                    chapters.set(epId, epTitle)
                }
            }

            if (chapters.size === 0) {
                let count = 1
                for (let link of chapterLinks) {
                    let href = link.attributes["href"] || ""
                    let epMatch = href.match(/\/wapchapter\/(\d+)/)
                    if (epMatch) {
                        let epId = epMatch[1]
                        if (!seen.has(epId)) {
                            seen.add(epId)
                            chapters.set(epId, '\u7B2C' + count + '\u8BDD')
                            count++
                        }
                    }
                }
            }

            document.dispose()
            return new ComicDetails({
                title: title,
                cover: cover,
                description: desc,
                tags: tags,
                chapters: chapters,
            })
        },

        loadEp: async (comicId, epId) => {
            let url = this.url + "wapchapter/" + epId
            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let html = res.body
            let images = []
            let seen = new Set()

            let dataImgs = html.match(/data-[a-z]+="([^"]+\.(jpg|png|webp))"/g) || []
            for (let i = 0; i < dataImgs.length; i++) {
                let match = dataImgs[i].match(/data-[a-z]+="([^"]+\.(jpg|png|webp))"/)
                if (match) {
                    let imgUrl = match[1]
                    if (seen.has(imgUrl)) continue
                    if (imgUrl.indexOf('default.jpg') >= 0) continue
                    if (imgUrl.indexOf('banner') >= 0) continue

                    if (imgUrl.startsWith('//')) {
                        imgUrl = 'https:' + imgUrl
                    } else if (imgUrl.startsWith('/')) {
                        imgUrl = this.url.replace(/\/$/, '') + imgUrl
                    }

                    seen.add(imgUrl)
                    images.push(imgUrl)
                }
            }

            if (images.length === 0) {
                let document = new HtmlDocument(html)
                let imgs = document.querySelectorAll('img')
                for (let img of imgs) {
                    let dataSrc = img.attributes["data-original"] || img.attributes["data-src"] || ""
                    let src = img.attributes["src"] || ""
                    let realSrc = dataSrc || src

                    if (!realSrc || seen.has(realSrc)) continue
                    if (realSrc.indexOf('default.jpg') >= 0) continue
                    if (realSrc.indexOf('banner') >= 0) continue
                    if (realSrc.indexOf('wapsearch') >= 0) continue
                    if (realSrc.indexOf('logo') >= 0) continue

                    if (realSrc.startsWith('//')) {
                        realSrc = 'https:' + realSrc
                    } else if (realSrc.startsWith('/')) {
                        realSrc = this.url.replace(/\/$/, '') + realSrc
                    }

                    if (realSrc.indexOf('pic.roumh') >= 0 || realSrc.indexOf('roum') >= 0) {
                        seen.add(realSrc)
                        images.push(realSrc)
                    }
                }
                document.dispose()
            }

            return {
                images: images
            }
        },

        onImageLoad: (url, comicId, epId) => {
            return {
                headers: {
                    "Referer": "https://m.roumanhua.net/"
                }
            }
        },
    }
}
