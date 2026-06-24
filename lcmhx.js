/** @type {import('./_venera_.js')} */

class LcmhxSource extends ComicSource {
    name = "乐成漫画"
    key = "lcmhx"
    version = "1.0.0"
    minAppVersion = "1.6.0"
    url = "https://www.lcmhx.cc/"

    parseComicCard(cardEl) {
        let linkEl = cardEl.querySelector('a[href^="/mc-"]')
        if (!linkEl) return null

        let href = linkEl.attributes["href"] || ""
        let idMatch = href.match(/\/mc-(\d+)\//)
        if (!idMatch) return null
        let id = idMatch[1]

        let imgEl = cardEl.querySelector('img[src*="cover.jpg"]')
        let cover = ""
        let title = ""

        if (imgEl) {
            cover = imgEl.attributes["src"] || ""
            title = imgEl.attributes["alt"] || imgEl.attributes["title"] || ""
        }

        if (!title) {
            let titleEl = cardEl.querySelector('.card__title, .hvc__title')
            if (titleEl) {
                title = titleEl.text.trim()
            }
        }

        if (!id || !title) return null

        return new Comic({
            id: id,
            title: title,
            cover: cover,
        })
    }

    parseComicsFromHtml(html) {
        let document = new HtmlDocument(html)
        let comics = []
        let seen = new Set()

        let cards = document.querySelectorAll('a[href^="/mc-"]')
        for (let card of cards) {
            let href = card.attributes["href"] || ""
            let idMatch = href.match(/\/mc-(\d+)\//)
            if (!idMatch) continue

            let id = idMatch[1]
            if (seen.has(id)) continue
            seen.add(id)

            let img = card.querySelector('img[src*="cover.jpg"]')
            if (!img) continue

            let cover = img.attributes["src"] || ""
            let title = img.attributes["alt"] || img.attributes["title"] || ""
            if (!title) {
                let titleEl = card.querySelector('.card__title, .truncate')
                if (titleEl) {
                    title = titleEl.text.trim()
                }
            }

            if (title && cover) {
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
            title: "乐成漫画",
            type: "multiPartPage",
            load: async (page) => {
                let res = await Network.get(this.url)
                if (res.status !== 200) {
                    throw `Invalid status code: ${res.status}`
                }

                let document = new HtmlDocument(res.body)
                let result = []

                let sectionNames = ["韩漫", "单行本", "同人志", "Cosplay"]
                let contentIds = ["content-1", "content-2", "content-3", "content-4"]

                let allCards = document.querySelectorAll('a[href^="/mc-"]')
                let seenGlobal = new Set()
                let sectionComics = [[], [], [], []]

                let inSection = -1
                for (let card of allCards) {
                    let outer = card.outerHtml || ""

                    for (let i = 0; i < contentIds.length; i++) {
                        if (outer.includes(contentIds[i]) || res.body.indexOf(outer.substring(0, 50)) > res.body.indexOf(contentIds[i])) {
                        }
                    }
                }

                let html = res.body
                for (let i = 0; i < contentIds.length; i++) {
                    let cid = contentIds[i]
                    let startIdx = html.indexOf('id="' + cid + '"')
                    if (startIdx < 0) continue

                    let endIdx = html.length
                    for (let j = i + 1; j < contentIds.length; j++) {
                        let nextIdx = html.indexOf('id="' + contentIds[j] + '"')
                        if (nextIdx > startIdx) {
                            endIdx = nextIdx
                            break
                        }
                    }

                    let sectionHtml = html.substring(startIdx, endIdx)
                    let sectionDoc = new HtmlDocument(sectionHtml)
                    let sectionCards = sectionDoc.querySelectorAll('a[href^="/mc-"]')
                    let seen = new Set()

                    for (let card of sectionCards) {
                        let href = card.attributes["href"] || ""
                        let idMatch = href.match(/\/mc-(\d+)\//)
                        if (!idMatch) continue

                        let id = idMatch[1]
                        if (seen.has(id)) continue
                        seen.add(id)
                        seenGlobal.add(id)

                        let img = card.querySelector('img[src*="cover.jpg"]')
                        if (!img) continue

                        let cover = img.attributes["src"] || ""
                        let title = img.attributes["alt"] || img.attributes["title"] || ""

                        if (title && cover) {
                            sectionComics[i].push(new Comic({
                                id: id,
                                title: title,
                                cover: cover,
                            }))
                        }
                    }

                    sectionDoc.dispose()
                }

                for (let i = 0; i < sectionNames.length; i++) {
                    if (sectionComics[i].length > 0) {
                        result.push({
                            title: sectionNames[i],
                            comics: sectionComics[i],
                            viewMore: {
                                page: "category",
                                attributes: {
                                    category: sectionNames[i],
                                    param: String(i + 1),
                                }
                            }
                        })
                    }
                }

                if (result.length === 0) {
                    let comics = this.parseComicsFromHtml(res.body)
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
        title: "乐成漫画",
        parts: [
            {
                name: "分类",
                type: "fixed",
                categories: ["全部", "韩漫", "单行本", "同人志", "Cosplay"],
                categoryParams: ["", "1", "2", "3", "4"],
                itemType: "category",
            }
        ],
        enableRankingPage: false,
    }

    categoryComics = {
        load: async (category, param, options, page) => {
            let url
            if (param) {
                url = this.url + "mctype/" + param + "/"
                if (page > 1) {
                    url += "index-" + page + ".html"
                }
            } else {
                url = this.url
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
        optionList: [],
    }

    search = {
        load: async (keyword, options, page) => {
            let url = this.url + "index.php?wd=" + encodeURIComponent(keyword)
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
            let url = this.url + "mc-" + id + "/"
            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let html = res.body
            let document = new HtmlDocument(html)

            let title = ""
            let titleEl = document.querySelector('h1')
            if (titleEl) {
                title = titleEl.text.trim()
            }
            if (!title) {
                let ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/)
                if (ogTitle) {
                    title = ogTitle[1]
                }
            }

            let cover = ""
            let coverImg = document.querySelector('img[src*="cover.jpg"]')
            if (coverImg) {
                cover = coverImg.attributes["src"] || ""
            }
            if (!cover) {
                let ogImg = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/)
                if (ogImg) {
                    cover = ogImg[1]
                }
            }

            let desc = ""
            let ogDesc = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"/)
            if (ogDesc) {
                desc = ogDesc[1]
            }

            let chapters = new Map()
            let chapterLinks = document.querySelectorAll('a[href^="/mc-' + id + '-"]')
            let seen = new Set()

            for (let link of chapterLinks) {
                let href = link.attributes["href"] || ""
                let epMatch = href.match(/\/mc-\d+-(\d+)\//)
                if (!epMatch) continue

                let epId = epMatch[1]
                if (seen.has(epId)) continue
                seen.add(epId)

                let epTitle = link.text.trim()
                if (!epTitle) {
                    let titleDiv = link.querySelector('.truncate')
                    if (titleDiv) {
                        epTitle = titleDiv.text.trim()
                    }
                }

                if (epTitle && /^\\u7B2C/.test(epTitle)) {
                    chapters.set(epId, epTitle)
                }
            }

            if (chapters.size === 0) {
                let allLinks = document.querySelectorAll('a[href^="/mc-' + id + '"]')
                let count = 1
                for (let link of allLinks) {
                    let href = link.attributes["href"] || ""
                    let epMatch = href.match(/\/mc-\d+-(\d+)\//)
                    if (epMatch && !seen.has(epMatch[1])) {
                        let epId = epMatch[1]
                        seen.add(epId)
                        chapters.set(epId, "第" + count + "话")
                        count++
                    }
                }
            }

            let tags = { "分类": [], "作者": [] }

            document.dispose()
            return new ComicDetails({
                title: title,
                cover: cover,
                desc: desc,
                chapters: chapters,
                tags: tags,
            })
        },

        loadEp: async (comicId, epId) => {
            let url = this.url + "mc-" + comicId + "-" + epId + "/"
            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let html = res.body
            let images = []
            let seen = new Set()

            let imgMatches = html.match(/https?:\/\/[^\s"'<>]*\.comicimgs\.com[^\s"'<>]*\.(jpg|png|webp)/g) || []
            for (let imgUrl of imgMatches) {
                if (seen.has(imgUrl)) continue
                if (imgUrl.includes('cover')) continue
                seen.add(imgUrl)
                images.push(imgUrl)
            }

            if (images.length === 0) {
                let document = new HtmlDocument(html)
                let imgs = document.querySelectorAll('img[src*="comicimgs"]')
                for (let img of imgs) {
                    let src = img.attributes["src"] || ""
                    if (src && !seen.has(src) && !src.includes('cover')) {
                        seen.add(src)
                        images.push(src)
                    }
                }
                document.dispose()
            }

            let title = ""
            let titleMatch = html.match(/<title>([^<]*\\u7B2C[^<]*)</title>/)
            if (titleMatch) {
                title = titleMatch.group(1).trim()
            }

            return {
                images: images,
                title: title
            }
        },

        onImageLoad: (url, comicId, epId) => {
            return {
                headers: {
                    "Referer": "https://www.lcmhx.cc/"
                }
            }
        },
    }
}
