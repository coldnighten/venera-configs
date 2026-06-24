/** @type {import('./_venera_.js')} */

class Dm5Source extends ComicSource {
    name = "动漫屋"
    key = "dm5"
    version = "1.0.0"
    minAppVersion = "1.6.0"
    url = "https://www.dm5.com/"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }

    explore = [
        {
            title: "动漫屋",
            type: "multiPartPage",
            load: async (page) => {
                let res = await Network.get(this.url, this.headers)
                if (res.status !== 200) {
                    throw `Invalid status code: ${res.status}`
                }

                let document = new HtmlDocument(res.body)
                let result = []

                let sectionTitles = document.querySelectorAll("div.index-title h2")
                let sectionBlocks = document.querySelectorAll("div.index-original, div.index-manga")

                for (let i = 0; i < Math.min(sectionTitles.length, sectionBlocks.length); i++) {
                    let title = sectionTitles[i].text.trim()
                    let block = sectionBlocks[i]
                    let items = block.querySelectorAll("li")

                    let comics = []
                    for (let item of items) {
                        let coverElem = item.querySelector("p.mh-cover")
                        let titleElem = item.querySelector("h2.title a, p.title a")
                        let cover = ""
                        let id = ""
                        let comicTitle = ""

                        if (coverElem) {
                            let style = coverElem.attributes["style"] || ""
                            let match = style.match(/url\(['"]?([^'")]+)['"]?\)/)
                            if (match) {
                                cover = match[1]
                            }
                        }

                        if (titleElem) {
                            comicTitle = titleElem.text.trim()
                            let href = titleElem.attributes["href"] || ""
                            if (href.includes("/manhua-")) {
                                id = href.replace(/^.*\/manhua-/, "").replace(/\/$/, "")
                            }
                        }

                        if (id && comicTitle) {
                            comics.push(new Comic({
                                id: id,
                                title: comicTitle,
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
        title: "动漫屋",
        parts: [
            {
                name: "题材",
                type: "fixed",
                categories: [
                    { label: "全部", target: { page: "category", attributes: { category: "全部", param: "manhua-list" } } },
                    { label: "热血", target: { page: "category", attributes: { category: "热血", param: "manhua-rexue" } } },
                    { label: "恋爱", target: { page: "category", attributes: { category: "恋爱", param: "manhua-aiqing" } } },
                    { label: "校园", target: { page: "category", attributes: { category: "校园", param: "manhua-xiaoyuan" } } },
                    { label: "冒险", target: { page: "category", attributes: { category: "冒险", param: "manhua-maoxian" } } },
                    { label: "后宫", target: { page: "category", attributes: { category: "后宫", param: "manhua-hougong" } } },
                    { label: "科幻", target: { page: "category", attributes: { category: "科幻", param: "manhua-kehuan" } } },
                    { label: "战争", target: { page: "category", attributes: { category: "战争", param: "manhua-zhanzheng" } } },
                    { label: "悬疑", target: { page: "category", attributes: { category: "悬疑", param: "manhua-xuanyi" } } },
                    { label: "推理", target: { page: "category", attributes: { category: "推理", param: "manhua-zhentan" } } },
                    { label: "搞笑", target: { page: "category", attributes: { category: "搞笑", param: "manhua-gaoxiao" } } },
                    { label: "奇幻", target: { page: "category", attributes: { category: "奇幻", param: "manhua-qihuan" } } },
                    { label: "魔法", target: { page: "category", attributes: { category: "魔法", param: "manhua-mofa" } } },
                    { label: "神鬼", target: { page: "category", attributes: { category: "神鬼", param: "manhua-dongfangshengui" } } },
                    { label: "历史", target: { page: "category", attributes: { category: "历史", param: "manhua-lishi" } } },
                    { label: "运动", target: { page: "category", attributes: { category: "运动", param: "manhua-jingji" } } },
                    { label: "机甲", target: { page: "category", attributes: { category: "机甲", param: "manhua-jizhan" } } },
                ]
            }
        ],
        enableRankingPage: false,
    }

    categoryComics = {
        load: async (category, param, options, page) => {
            let baseUrl = `https://www.dm5.com/${param}/`
            if (page > 1) {
                baseUrl = `https://www.dm5.com/${param}-p${page}/`
            }

            let res = await Network.get(baseUrl, this.headers)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let document = new HtmlDocument(res.body)
            let items = document.querySelectorAll("ul.mh-list li")

            let comics = []
            for (let item of items) {
                let coverElem = item.querySelector("p.mh-cover")
                let titleElem = item.querySelector("h2.title a, p.title a")
                let cover = ""
                let id = ""
                let comicTitle = ""

                if (coverElem) {
                    let style = coverElem.attributes["style"] || ""
                    let match = style.match(/url\(['"]?([^'")]+)['"]?\)/)
                    if (match) {
                        cover = match[1]
                    }
                }

                if (titleElem) {
                    comicTitle = titleElem.text.trim()
                    let href = titleElem.attributes["href"] || ""
                    if (href.includes("/manhua-")) {
                        id = href.replace(/^.*\/manhua-/, "").replace(/\/$/, "")
                    }
                }

                if (id && comicTitle) {
                    comics.push(new Comic({
                        id: id,
                        title: comicTitle,
                        cover: cover,
                    }))
                }
            }

            let maxPage = 1
            let pageLinks = document.querySelectorAll(".page-pagination a")
            for (let link of pageLinks) {
                let href = link.attributes["href"] || ""
                let text = link.text.trim()
                if (/^\d+$/.test(text)) {
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
            let url = `https://www.dm5.com/search?title=${encodeURIComponent(keyword)}&language=1`
            if (page > 1) {
                url = url + `&page=${page}`
            }

            let res = await Network.get(url, this.headers)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let document = new HtmlDocument(res.body)
            let items = document.querySelectorAll("ul.mh-list li")

            let comics = []
            for (let item of items) {
                let coverElem = item.querySelector("p.mh-cover")
                let titleElem = item.querySelector("h2.title a, p.title a")
                let cover = ""
                let id = ""
                let comicTitle = ""

                if (coverElem) {
                    let style = coverElem.attributes["style"] || ""
                    let match = style.match(/url\(['"]?([^'")]+)['"]?\)/)
                    if (match) {
                        cover = match[1]
                    }
                }

                if (titleElem) {
                    comicTitle = titleElem.text.trim()
                    let href = titleElem.attributes["href"] || ""
                    if (href.includes("/manhua-")) {
                        id = href.replace(/^.*\/manhua-/, "").replace(/\/$/, "")
                    }
                }

                if (id && comicTitle) {
                    comics.push(new Comic({
                        id: id,
                        title: comicTitle,
                        cover: cover,
                    }))
                }
            }

            let maxPage = 1
            let pageLinks = document.querySelectorAll(".page-pagination a")
            for (let link of pageLinks) {
                let href = link.attributes["href"] || ""
                let text = link.text.trim()
                if (/^\d+$/.test(text)) {
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
            let url = `https://www.dm5.com/manhua-${id}/`
            let res = await Network.get(url, this.headers)

            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let html = res.body
            let document = new HtmlDocument(html)

            let title = ""
            let titleElem = document.querySelector(".banner_detail_form .info .title")
            if (titleElem) {
                title = titleElem.text.trim()
                title = title.replace(/\d+\.\d+分$/, "").trim()
            }

            let cover = ""
            let coverImg = document.querySelector(".banner_detail_form .cover img")
            if (coverImg) {
                cover = coverImg.attributes["src"] || ""
            }

            let author = ""
            let authorElem = document.querySelector(".banner_detail_form .info .subtitle a")
            if (authorElem) {
                author = authorElem.text.trim()
            }

            let description = ""
            let descElem = document.querySelector(".banner_detail_form .info .content")
            if (descElem) {
                description = descElem.text.trim()
            }

            let tags = []
            let tagLinks = document.querySelectorAll(".banner_detail_form .info .tip a")
            for (let link of tagLinks) {
                let href = link.attributes["href"] || ""
                if (href.includes("/manhua-")) {
                    let text = link.text.trim()
                    if (text && tags.indexOf(text) === -1) {
                        tags.push(text)
                    }
                }
            }

            let chapters = new Map()
            let chapterItems = document.querySelectorAll("#chapterlistload ul.view-detail-list li a")
            for (let item of chapterItems) {
                let href = item.attributes["href"] || ""
                let chId = ""
                if (href.includes("/m")) {
                    chId = href.replace(/^.*\/m/, "").replace(/\/$/, "")
                }
                let titleElem = item.querySelector("p.title")
                let chTitle = ""
                if (titleElem) {
                    chTitle = titleElem.text.trim().replace(/\s*\（\d+P\）\s*$/, "")
                } else {
                    chTitle = item.text.trim()
                }
                if (chId && chTitle) {
                    chapters.set(chId, chTitle)
                }
            }

            let updateTime = ""
            let updateElem = document.querySelector(".detail-list-title .s")
            if (updateElem) {
                let text = updateElem.text.trim()
                let match = text.match(/(\d{4}-\d{2}-\d{2})/)
                if (match) {
                    updateTime = match[1]
                }
            }

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
            let url = `https://www.dm5.com/m${epId}/`
            let res = await Network.get(url, this.headers)

            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let html = res.body
            let images = []

            let midMatch = html.match(/var\s+DM5_MID\s*=\s*(\d+)/)
            let cidMatch = html.match(/var\s+DM5_CID\s*=\s*(\d+)/)
            let signMatch = html.match(/var\s+DM5_VIEWSIGN\s*=\s*["']([^"']+)["']/)
            let signDtMatch = html.match(/var\s+DM5_VIEWSIGN_DT\s*=\s*["']([^"']+)["']/)
            let countMatch = html.match(/var\s+DM5_IMAGE_COUNT\s*=\s*(\d+)/)

            let mid = midMatch ? midMatch[1] : ""
            let cid = cidMatch ? cidMatch[1] : ""
            let sign = signMatch ? signMatch[1] : ""
            let signDt = signDtMatch ? signDtMatch[1] : ""
            let totalCount = countMatch ? parseInt(countMatch[1]) : 0

            if (mid && cid && sign && signDt && totalCount > 0) {
                let pageNum = 1
                while (images.length < totalCount && pageNum <= Math.ceil(totalCount / 2) + 1) {
                    let apiUrl = `https://www.dm5.com/m${cid}/chapterfun.ashx?cid=${cid}&page=${pageNum}&key=&language=1&gtk=6&_cid=${cid}&_mid=${mid}&_dt=${encodeURIComponent(signDt)}&_sign=${sign}`
                    let apiHeaders = {
                        "User-Agent": this.headers["User-Agent"],
                        "Referer": url,
                        "X-Requested-With": "XMLHttpRequest",
                    }

                    let apiRes = await Network.get(apiUrl, apiHeaders)
                    if (apiRes.status === 200) {
                        let pageImages = this.evalPacker(apiRes.body)
                        if (pageImages && pageImages.length > 0) {
                            for (let img of pageImages) {
                                if (images.indexOf(img) === -1) {
                                    images.push(img)
                                }
                            }
                        } else {
                            break
                        }
                    } else {
                        break
                    }
                    pageNum++
                }
            }

            if (images.length === 0) {
                throw "未能提取任何图片，请检查页面结构"
            }

            return {
                images: images
            }
        },

        onImageLoad: (url, comicId, epId) => {
            return {
                headers: {
                    "Referer": "https://www.dm5.com/",
                }
            }
        }
    }

    evalPacker(code) {
        try {
            let match = code.match(/eval\(function\(p,a,c,k,e,d\)\{.*?\}\('(.+?)',(\d+),(\d+),'(.+?)'\.split\('\|'\),0,\{\}\)\)/)
            if (!match) {
                return []
            }

            let p = match[1]
            let a = parseInt(match[2])
            let c = parseInt(match[3])
            let k = match[4].split('|')

            let e = function (c_val) {
                let result = ''
                while (true) {
                    if (c_val < a) {
                        if (c_val > 35) {
                            result = String.fromCharCode(c_val + 29) + result
                        } else {
                            result = c_val.toString(36) + result
                        }
                        break
                    } else {
                        let rem = c_val % a
                        if (rem > 35) {
                            result = String.fromCharCode(rem + 29) + result
                        } else {
                            result = rem.toString(36) + result
                        }
                        c_val = Math.floor(c_val / a)
                    }
                }
                return result
            }

            let d = {}
            for (let i = c - 1; i >= 0; i--) {
                let encoded = e(i)
                d[encoded] = k[i] || encoded
            }

            let decoded = p.replace(/\b\w+\b/g, function (word) {
                return d[word] || word
            })

            let result = eval(decoded)
            if (Array.isArray(result)) {
                return result
            }
            return []
        } catch (e) {
            console.warn("packer解码失败:", e)
            return []
        }
    }
}
