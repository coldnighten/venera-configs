class WManhuaSource extends ComicSource {
    name = "W漫画"
    key = "wmanhua"
    version = "1.0.0"
    minAppVersion = "1.6.0"
    url = "https://www.wmanhua.com/"

    explore = [
        {
            title: "W漫画",
            type: "multiPartPage",
            load: async (page) => {
                let res = await Network.get(this.url)
                if (res.status !== 200) {
                    throw `Invalid status code: ${res.status}`
                }

                let document = new HtmlDocument(res.body)
                let result = []

                let sections = document.querySelectorAll(".card-main")
                for (let sec of sections) {
                    let titleElem = sec.querySelector("h2")
                    let title = titleElem ? titleElem.text.trim() : ""
                    if (!title) continue

                    let comics = []
                    let items = sec.querySelectorAll(".card-content")
                    for (let item of items) {
                        let link = item.querySelector("a")
                        let img = item.querySelector("img")

                        let id = ""
                        let href = link ? (link.attributes["href"] || "") : ""
                        let match = href.match(/\/comic\/(\d+)\.html/)
                        if (match) {
                            id = match[1]
                        }

                        let titleText = ""
                        if (link) {
                            let titleElem2 = link.querySelector(".cardtitle, h3")
                            titleText = titleElem2 ? titleElem2.text.trim() : link.text.trim()
                        }

                        let cover = ""
                        if (img) {
                            cover = img.attributes["data-src"] || img.attributes["src"] || ""
                        }

                        if (id && titleText) {
                            comics.push(new Comic({
                                id: id,
                                title: titleText,
                                cover: cover,
                            }))
                        }
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

    category = {
        title: "W漫画",
        parts: [
            {
                name: "分类",
                type: "fixed",
                categories: [
                    "全部", "欢乐", "生活", "爱情", "奇幻", "冒险", "轻改", "魔幻",
                    "重生", "修仙", "校园", "悬疑", "侦探", "玄幻", "职场", "搞笑",
                    "格斗", "游戏", "灵异", "性转", "仙侠", "都市", "后宫", "穿越",
                    "百合", "转生", "女主", "热血", "末世", "异界", "异能", "长篇",
                    "萌系", "系统", "魔法", "科幻", "日常", "惊悚", "恐怖", "武侠",
                    "励志", "耽美", "复仇", "养成", "同人", "美食", "言情", "逆袭",
                    "竞技", "战争", "爆笑", "生存", "战斗", "诡异", "网游", "推理",
                    "恋爱"
                ],
                categoryParams: [
                    "0", "1", "2", "3", "4", "5", "6", "7",
                    "8", "9", "10", "11", "12", "13", "14", "15",
                    "16", "17", "18", "19", "20", "21", "22", "23",
                    "24", "25", "26", "27", "28", "29", "30", "31",
                    "33", "34", "35", "36", "37", "38", "63", "44",
                    "45", "47", "48", "49", "50", "54", "55", "56",
                    "57", "59", "60", "62", "65", "68", "69", "71",
                    "72"
                ],
                itemType: "category",
            }
        ],
        enableRankingPage: false,
    }

    categoryComics = {
        load: async (category, param, options, page) => {
            let tag = param || "0"
            let url = `${this.url}sort?category=0&tag=${tag}`
            if (page > 1) {
                url = url + `&page=${page}`
            }

            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let document = new HtmlDocument(res.body)
            let items = document.querySelectorAll(".card-content")

            let comics = []
            for (let item of items) {
                let link = item.querySelector("a")
                let img = item.querySelector("img")

                let id = ""
                let href = link ? (link.attributes["href"] || "") : ""
                let match = href.match(/\/comic\/(\d+)\.html/)
                if (match) {
                    id = match[1]
                }

                let titleText = ""
                if (link) {
                    let titleElem2 = link.querySelector(".cardtitle, h3")
                    titleText = titleElem2 ? titleElem2.text.trim() : link.text.trim()
                }

                let cover = ""
                if (img) {
                    cover = img.attributes["data-src"] || img.attributes["src"] || ""
                }

                if (id && titleText) {
                    comics.push(new Comic({
                        id: id,
                        title: titleText,
                        cover: cover,
                    }))
                }
            }

            let maxPage = 1
            let allLinks = document.querySelectorAll("a")
            for (let link of allLinks) {
                let href = link.attributes["href"] || ""
                let text = link.text.trim()
                if (href.indexOf("page=") >= 0 && /^\d+$/.test(text)) {
                    let num = parseInt(text)
                    if (num > maxPage) {
                        maxPage = num
                    }
                }
            }

            document.dispose()
            return {
                comics: comics,
                maxPage: maxPage
            }
        },
        optionList: []
    }

    search = {
        load: async (keyword, options, page) => {
            let url = `${this.url}search?query=${encodeURIComponent(keyword)}`
            if (page > 1) {
                url = url + `&page=${page}`
            }

            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let document = new HtmlDocument(res.body)
            let items = document.querySelectorAll(".card-content")

            let comics = []
            for (let item of items) {
                let link = item.querySelector("a")
                let img = item.querySelector("img")

                let id = ""
                let href = link ? (link.attributes["href"] || "") : ""
                let match = href.match(/\/comic\/(\d+)\.html/)
                if (match) {
                    id = match[1]
                }

                let titleText = ""
                if (link) {
                    let titleElem2 = link.querySelector(".cardtitle, h3")
                    titleText = titleElem2 ? titleElem2.text.trim() : link.text.trim()
                }

                let cover = ""
                if (img) {
                    cover = img.attributes["data-src"] || img.attributes["src"] || ""
                }

                if (id && titleText) {
                    comics.push(new Comic({
                        id: id,
                        title: titleText,
                        cover: cover,
                    }))
                }
            }

            let maxPage = 1
            let allLinks = document.querySelectorAll("a")
            for (let link of allLinks) {
                let href = link.attributes["href"] || ""
                let text = link.text.trim()
                if (href.indexOf("page=") >= 0 && /^\d+$/.test(text)) {
                    let num = parseInt(text)
                    if (num > maxPage) {
                        maxPage = num
                    }
                }
            }

            document.dispose()
            return {
                comics: comics,
                maxPage: maxPage
            }
        },
        enableTagsSuggestions: false,
    }

    comic = {
        loadInfo: async (id) => {
            let url = `${this.url}comic/${id}.html`
            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let document = new HtmlDocument(res.body)

            let titleElem = document.querySelector("h1")
            let title = titleElem ? titleElem.text.trim() : ""

            let coverImg = document.querySelector("img[alt*='封面'], .cover img, img[src*='cover']")
            let cover = ""
            if (coverImg) {
                cover = coverImg.attributes["src"] || coverImg.attributes["data-src"] || ""
            }
            if (!cover) {
                let allImgs = document.querySelectorAll("img")
                for (let img of allImgs) {
                    let src = img.attributes["src"] || ""
                    if (src.indexOf("cover") >= 0) {
                        cover = src
                        break
                    }
                }
            }

            let description = ""
            let descElem = document.querySelector(".comic-desc, .description, .intro, .comic-info p")
            if (descElem) {
                description = descElem.text.trim()
            }

            let author = ""

            let tags = []
            let breadcrumbLinks = document.querySelectorAll(".breadcrumb a, .nav a")
            for (let link of breadcrumbLinks) {
                let text = link.text.trim()
                let href = link.attributes["href"] || ""
                if (text && text !== "首页" && text !== "W漫画" && href.indexOf("/sort") >= 0) {
                    tags.push(text)
                }
            }

            let chapters = new Map()
            let allLinks = document.querySelectorAll("a")
            for (let link of allLinks) {
                let href = link.attributes["href"] || ""
                let chMatch = href.match(/\/chapter\/(\d+-\d+)\.html/)
                if (chMatch) {
                    let chId = chMatch[1]
                    let chTitle = link.text.trim()
                    if (chId && chTitle && !chapters.has(chId)) {
                        chapters.set(chId, chTitle)
                    }
                }
            }

            let updateTime = ""

            document.dispose()

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
            let url = `${this.url}chapter/${epId}.html`
            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let document = new HtmlDocument(res.body)
            let images = []

            let imgContainer = document.querySelector(".images")
            if (imgContainer) {
                let imgs = imgContainer.querySelectorAll("img")
                for (let img of imgs) {
                    let src = img.attributes["data-src"] || img.attributes["src"] || ""
                    if (src && src.indexOf("wmanhua.com") >= 0 &&
                        src.indexOf(".webp") >= 0 &&
                        src.indexOf("loading") === -1 &&
                        src.indexOf("/cover") === -1 &&
                        images.indexOf(src) === -1) {
                        images.push(src)
                    }
                }
            }

            if (images.length === 0) {
                let html = res.body
                let pattern = /https?:\/\/image\d*\.wmanhua\.com[^\s"'<>]+\.(webp|jpg|png|jpeg)[^\s"'<>]*/gi
                let matches = html.match(pattern)
                if (matches) {
                    for (let m of matches) {
                        if (m.indexOf("/cover") === -1 &&
                            m.indexOf("loading") === -1 &&
                            images.indexOf(m) === -1) {
                            images.push(m)
                        }
                    }
                }
            }

            document.dispose()
            return {
                images: images
            }
        }
    }
}
