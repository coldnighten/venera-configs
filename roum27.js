/** @type {import('./_venera_.js')} */

class Roum27Source extends ComicSource {
    name = "肉漫屋"
    key = "roum27"
    version = "1.1.0"
    minAppVersion = "1.6.0"
    url = "https://cdn.jsdelivr.net/gh/coldnighten/venera-configs@main/roum27.js"

    settings = {
        domains: {
            title: "自定义域名",
            type: "input",
            default: "rouman28.xyz"
        },
        permanentDomain: {
            title: "永久域名",
            type: "callback",
            buttonText: "查看",
            callback: () => {
                UI.showMessage("永久域名：rouman5.com");
            }
        },
        domainCheck: {
            title: "检测当前域名",
            type: "callback",
            buttonText: "检测",
            callback: () => {
                const currentDomain = this.loadSetting("domains");
                const testUrl = `https://${currentDomain}/`;
                const startTime = Date.now();
                let isCompleted = false;

                const loadingId = UI.showLoading(() => {
                    UI.showMessage("检测已取消");
                    isCompleted = true;
                });

                setTimeout(() => {
                    if (!isCompleted) {
                        UI.cancelLoading(loadingId);
                        UI.showMessage("❌ 连接超时，可能需要 🚀");
                        isCompleted = true;
                    }
                }, 10000);

                Network.get(testUrl).then(res => {
                    if (isCompleted) return;
                    const delay = Date.now() - startTime;
                    UI.cancelLoading(loadingId);
                    UI.showMessage(`✅ 连接正常，延迟: ${delay}ms`);
                    isCompleted = true;
                }).catch(() => {
                    if (isCompleted) return;
                    UI.cancelLoading(loadingId);
                    UI.showMessage("❌ 连接失败，可能需要 🚀");
                    isCompleted = true;
                });
            }
        }
    }

    get baseUrl() {
        return `https://${this.loadSetting("domains")}/`;
    }

    parseComicFromLink(linkEl) {
        let href = linkEl.attributes["href"] || ""
        let id = href.replace("/books/", "")
        if (!id) return null

        let cover = ""
        let bgDiv = linkEl.querySelector("[style*='background-image']")
        if (bgDiv) {
            let style = bgDiv.attributes["style"] || ""
            let match = style.match(/url\(["']?([^"')]+)["']?\)/)
            if (match) {
                cover = match[1]
            }
        }

        let title = ""
        let titleEl = linkEl.querySelector(".truncate.text-foreground, .text-foreground.truncate")
        if (titleEl) {
            title = titleEl.text.trim()
        }

        if (!title) {
            let allDivs = linkEl.querySelectorAll("div")
            for (let d of allDivs) {
                let cls = d.attributes["class"] || ""
                if (cls.includes("truncate") && cls.includes("text-foreground")) {
                    title = d.text.trim()
                    break
                }
            }
        }

        if (!id || !title) return null

        return new Comic({
            id: id,
            title: title,
            cover: cover,
        })
    }

    parseComicsFromGrid(document, gridSelector) {
        let comics = []
        let grid = gridSelector ? document.querySelector(gridSelector) : null
        let links = []

        if (grid) {
            links = grid.querySelectorAll('a[href^="/books/"]')
        } else {
            links = document.querySelectorAll('a[href^="/books/"]')
        }

        let seen = new Set()
        for (let link of links) {
            let href = link.attributes["href"] || ""
            let id = href.replace("/books/", "")
            if (id && !seen.has(id) && id.length > 10) {
                seen.add(id)
                let comic = this.parseComicFromLink(link)
                if (comic) {
                    comics.push(comic)
                }
            }
        }

        return comics
    }

    explore = [
        {
            title: "肉漫屋",
            type: "multiPartPage",
            load: async (page) => {
                let res = await Network.get(this.baseUrl + "home")
                if (res.status !== 200) {
                    throw `Invalid status code: ${res.status}`
                }

                let document = new HtmlDocument(res.body)
                let result = []

                let sectionTitles = ["正熱門", "今日最佳", "最近更新", "本週熱門", "已完結"]
                let allGrids = document.querySelectorAll('div[class*="grid-cols-"]')

                let comicGrids = []
                for (let g of allGrids) {
                    let cls = g.attributes["class"] || ""
                    if (cls.includes("sm:grid-cols-4") || cls.includes("md:grid-cols-6")) {
                        let links = g.querySelectorAll('a[href^="/books/"]')
                        if (links.length >= 3) {
                            comicGrids.push(g)
                        }
                    }
                }

                for (let i = 0; i < comicGrids.length && i < sectionTitles.length; i++) {
                    let grid = comicGrids[i]
                    let title = sectionTitles[i]

                    let comics = []
                    let links = grid.querySelectorAll('a[href^="/books/"]')
                    let seen = new Set()

                    for (let link of links) {
                        let href = link.attributes["href"] || ""
                        let id = href.replace("/books/", "")
                        if (id && !seen.has(id) && id.length > 10) {
                            seen.add(id)
                            let comic = this.parseComicFromLink(link)
                            if (comic) {
                                comics.push(comic)
                            }
                        }
                    }

                    if (comics.length > 0) {
                        result.push({ title: title, comics: comics })
                    }
                }

                if (result.length === 0) {
                    let comics = this.parseComicsFromGrid(document, null)
                    if (comics.length > 0) {
                        result.push({ title: "熱門漫畫", comics: comics.slice(0, 20) })
                    }
                }

                document.dispose()
                return result
            }
        }
    ]

    category = {
        title: "肉漫屋",
        parts: [
            {
                name: "分類",
                type: "fixed",
                categories: ["全部", "韓漫", "日漫", "國漫", "美漫"],
                categoryParams: ["", "korean", "japanese", "chinese", "western"],
                itemType: "category",
            }
        ],
        enableRankingPage: false,
    }

    categoryComics = {
        load: async (category, param, options, page) => {
            let url = this.baseUrl + "books"
            let params = []
            if (param) {
                params.push("lang=" + param)
            }
            if (page > 1) {
                params.push("page=" + page)
            }
            if (params.length > 0) {
                url += "?" + params.join("&")
            }

            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let document = new HtmlDocument(res.body)
            let comics = this.parseComicsFromGrid(document, null)

            document.dispose()
            return {
                comics: comics,
                maxPage: 10
            }
        },
        optionList: [
            {
                options: ["latest-最新", "popular-熱門"],
            },
        ],
    }

    search = {
        load: async (keyword, options, page) => {
            let url = this.baseUrl + "search?keyword=" + encodeURIComponent(keyword)
            if (page > 1) {
                url += "&page=" + page
            }

            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let document = new HtmlDocument(res.body)
            let comics = this.parseComicsFromGrid(document, null)

            document.dispose()
            return {
                comics: comics,
                maxPage: 10
            }
        },
        enableTagsSuggestions: false,
    }

    comic = {
        loadInfo: async (id) => {
            let url = this.baseUrl + "books/" + id
            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let document = new HtmlDocument(res.body)

            let title = ""
            let titleEl = document.querySelector(".text-2xl")
            if (titleEl) {
                title = titleEl.text.trim()
            }

            let cover = ""
            let bgDiv = document.querySelector("[style*='background-image']")
            if (bgDiv) {
                let style = bgDiv.attributes["style"] || ""
                let match = style.match(/url\(["']?([^"')]+)["']?\)/)
                if (match) {
                    cover = match[1]
                }
            }

            let desc = ""
            let descCandidates = document.querySelectorAll(".text-muted-foreground")
            for (let el of descCandidates) {
                let text = el.text.trim()
                if (text.length > 30 && text.length < 500) {
                    desc = text
                    break
                }
            }

            let chapters = new Map()
            let chapterLinks = document.querySelectorAll('a[href^="/books/' + id + '/"]')
            for (let link of chapterLinks) {
                let href = link.attributes["href"] || ""
                let epId = href.replace("/books/" + id + "/", "")
                if (epId && /^\d+$/.test(epId)) {
                    let epTitle = ""
                    let titleDiv = link.querySelector(".truncate")
                    if (titleDiv) {
                        epTitle = titleDiv.text.trim()
                    }
                    if (!epTitle) {
                        epTitle = link.text.trim()
                    }
                    if (epTitle) {
                        chapters.set(epId, epTitle)
                    }
                }
            }

            if (chapters.size === 0) {
                let allDivs = document.querySelectorAll("div")
                let count = 0
                for (let d of allDivs) {
                    let text = d.text.trim()
                    if (/^第\d+話/.test(text) && count < 200) {
                        chapters.set(String(count), text)
                        count++
                    }
                }
            }

            let tags = { "作者": [], "標籤": [] }
            let authorMatch = res.body.match(/作者[：:]\s*<[^>]*>([^<]+)</)
            if (authorMatch) {
                let author = authorMatch[1].replace(/&amp;/g, "&").trim()
                tags["作者"].push(author)
            }

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
            let url = this.baseUrl + "books/" + comicId + "/" + epId
            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let images = []
            let body = res.body

            let imgMatches = body.match(/"imageUrl":"([^"]+\.(jpg|png|webp))"/g) || []
            let seen = new Set()
            for (let match of imgMatches) {
                let urlMatch = match.match(/"imageUrl":"([^"]+)"/)
                if (urlMatch) {
                    let imgUrl = urlMatch[1]
                    if (!seen.has(imgUrl)) {
                        seen.add(imgUrl)
                        images.push(imgUrl)
                    }
                }
            }

            if (images.length === 0) {
                let directMatches = body.match(/https:\/\/r\d+\.rmcdn[^"\\']+\.jpg/g) || []
                let seen2 = new Set()
                for (let u of directMatches) {
                    if (!seen2.has(u) && u.includes("/m/")) {
                        seen2.add(u)
                        images.push(u)
                    }
                }
            }

            return {
                images: images,
                title: ""
            }
        },

        onImageLoad: (url, comicId, epId) => {
            return {
                headers: {
                    "Referer": this.baseUrl
                }
            }
        },
    }
}
