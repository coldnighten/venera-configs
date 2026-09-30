/** @type {import('./_venera_.js')} */

class LcmhxSource extends ComicSource {
    name = "乐成漫画"
    key = "lcmhx"
    version = "1.1.0"
    minAppVersion = "1.6.0"
    url = "https://lcmhx.cc/"

    /**
     * 从 HTML 中解析漫画卡片列表
     */
    parseComics(html, linkPrefix) {
        let document = new HtmlDocument(html)
        let comics = []
        let seen = new Set()

        let links = document.querySelectorAll('a[href^="' + linkPrefix + '"]')
        for (let link of links) {
            let href = link.attributes["href"] || ""
            let idMatch = href.match(/\/lcmh-(\d+)\//)
            if (!idMatch) continue

            let id = idMatch[1]
            if (seen.has(id)) continue
            seen.add(id)

            let img = link.querySelector("img")
            let cover = ""
            let title = ""

            if (img) {
                cover = img.attributes["data-bg2"] || img.attributes["data-src"] || img.attributes["src"] || ""
                title = img.attributes["title"] || img.attributes["alt"] || ""
            }

            if (!title) {
                let titleEl = link.querySelector(".hv-title, .card__title")
                if (titleEl) {
                    title = titleEl.text.trim()
                }
            }

            if (id && title) {
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

    /**
     * 过滤掉非漫画内容 (AI短剧、vlog等)
     */
    filterComics(comics) {
        return comics.filter(c => {
            let t = c.title || ""
            return !t.includes("短剧") && !t.toLowerCase().includes("vlog") && !t.includes("抖音")
        })
    }

    /**
     * 从 HTML 中提取漫画图片 (支持多域名: comicimgs.com, qy0.ru 等)
     */
    extractImages(html) {
        let images = []
        let seen = new Set()

        // 匹配所有常见图片域名的图片
        let imgMatches = html.match(/https?:\/\/[^\s"'<>]*?(comicimgs\.com|qy0\.ru|chigua\.media)[^\s"'<>]*?\.(jpg|jpeg|png|webp)/g) || []
        for (let imgUrl of imgMatches) {
            if (seen.has(imgUrl)) continue
            if (imgUrl.includes("cover")) continue
            seen.add(imgUrl)
            images.push(imgUrl)
        }

        // 兜底: runtime-image 类的图片 (单章漫画常用)
        if (images.length === 0) {
            let runtimeMatches = html.match(/<img[^>]*class="[^"]*runtime-image[^"]*"[^>]*>/g) || []
            for (let tag of runtimeMatches) {
                let srcMatch = tag.match(/src="([^"]+)"/)
                if (srcMatch) {
                    let src = srcMatch[1]
                    if (!seen.has(src) && !src.includes("cover")) {
                        seen.add(src)
                        images.push(src)
                    }
                }
            }
        }

        return images
    }

    /**
     * 探测某章节是否存在 (通过检查页面是否有漫画图片)
     */
    async chapterHasImages(id, epId) {
        try {
            let url = this.url + "lcmh-" + id + "-" + epId + "/"
            let res = await Network.get(url)
            if (res.status !== 200) return false
            return this.extractImages(res.body).length > 0
        } catch (e) {
            return false
        }
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

                let html = res.body
                let startIdx = html.indexOf('id="content-2"')
                let sectionHtml = html
                if (startIdx >= 0) {
                    let endIdx = html.indexOf('id="content-', startIdx + 10)
                    sectionHtml = endIdx > 0 ? html.substring(startIdx, endIdx) : html.substring(startIdx)
                }

                let comics = this.parseComics(sectionHtml, "/lcmh-")
                comics = this.filterComics(comics)

                let result = []
                if (comics.length > 0) {
                    result.push({
                        title: "热门漫画",
                        comics: comics,
                    })
                }

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
                categories: ["全部", "韩漫", "单行本", "同人志", "杂志&短篇", "CG画集", "3D漫画", "AI图集", "Cosplay"],
                categoryParams: ["", "1", "6", "7", "8", "16", "17", "18", "24"],
                itemType: "category",
            }
        ],
        enableRankingPage: false,
    }

    categoryComics = {
        load: async (category, param, options, page) => {
            let url
            if (param) {
                if (page > 1) {
                    url = this.url + "mctype/" + param + "-" + page + "/"
                } else {
                    url = this.url + "mctype/" + param + "/"
                }
            } else {
                url = this.url
            }

            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let html = res.body

            if (!param) {
                let startIdx = html.indexOf('id="content-2"')
                if (startIdx >= 0) {
                    let endIdx = html.indexOf('id="content-', startIdx + 10)
                    html = endIdx > 0 ? html.substring(startIdx, endIdx) : html.substring(startIdx)
                }
            }

            let comics = this.parseComics(html, "/lcmh-")
            comics = this.filterComics(comics)

            return {
                comics: comics,
                maxPage: 50
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

            let comics = this.parseComics(res.body, "/index.php/lcmh-")
            comics = this.filterComics(comics)

            return {
                comics: comics,
                maxPage: 10
            }
        },
        enableTagsSuggestions: false,
    }

    comic = {
        loadInfo: async (id) => {
            let url = this.url + "lcmh-" + id + "/"
            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let html = res.body
            let document = new HtmlDocument(html)

            // 标题
            let title = ""
            let titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/)
            if (titleMatch) {
                title = titleMatch[1].replace(/<[^>]+>/g, "").replace(/\s*-\s*乐成漫画\s*$/, "").trim()
            }

            // 封面: 优先用 og:image, 其次从图片 URL 推断
            let cover = ""
            let ogImageMatch = html.match(/property="og:image"[^>]*content="([^"]*)"/)
            if (ogImageMatch) {
                cover = ogImageMatch[1]
            }
            if (!cover) {
                let bookIdMatch = html.match(/comicimgs\.com\/static\/upload\/book\/(\d+)\//)
                if (bookIdMatch) {
                    cover = "https://www.comicimgs.com/static/upload/book/" + bookIdMatch[1] + "/cover.jpg"
                }
            }
            if (!cover) {
                let firstImg = this.extractImages(html)
                if (firstImg.length > 0) {
                    cover = firstImg[0]
                }
            }

            // 简介
            let desc = ""
            let descMatch = html.match(/property="og:description"[^>]*content="([^"]*)"/)
            if (descMatch) {
                desc = descMatch[1]
            }

            // 章节列表: 从 HTML 解析 (通常只显示前5章)
            let chapters = new Map()
            let chapterLinks = document.querySelectorAll('a[href^="/lcmh-' + id + '-"]')
            let seen = new Set()

            for (let link of chapterLinks) {
                let href = link.attributes["href"] || ""
                let epMatch = href.match(/\/lcmh-\d+-(\d+)\//)
                if (!epMatch) continue

                let epId = epMatch[1]
                if (seen.has(epId)) continue
                seen.add(epId)

                let epTitle = link.text.trim()
                if (!epTitle || epTitle === "<" || epTitle === ">") continue

                chapters.set(epId, epTitle)
            }

            // 始终确保第1话存在 (详情页即为第1话阅读页)
            if (!chapters.has("1")) {
                chapters.set("1", "第1话")
            }

            // 探测补全章节列表 (HTML 只显示前5章, 需要探测后续章节)
            let maxEp = 1
            for (let k of chapters.keys()) {
                let n = parseInt(k)
                if (n > maxEp) maxEp = n
            }

            // 指数搜索找上界
            let probe = maxEp + 1
            let upper = 0
            while (probe <= 2000) {
                let has = await this.chapterHasImages(id, probe)
                if (has) {
                    upper = probe
                    probe *= 2
                } else {
                    break
                }
            }

            // 二分搜索确定精确章节数
            if (upper > 0) {
                let low = maxEp + 1
                let high = upper
                while (low <= high) {
                    let mid = Math.floor((low + high) / 2)
                    let has = await this.chapterHasImages(id, mid)
                    if (has) {
                        maxEp = mid
                        low = mid + 1
                    } else {
                        high = mid - 1
                    }
                }
            }

            // 补全缺失的章节
            for (let i = 1; i <= maxEp; i++) {
                let key = String(i)
                if (!chapters.has(key)) {
                    chapters.set(key, "第" + i + "话")
                }
            }

            // 按章节序号排序
            let sortedChapters = new Map(
                [...chapters.entries()].sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            )

            document.dispose()

            return new ComicDetails({
                title: title,
                cover: cover,
                desc: desc,
                chapters: sortedChapters,
                tags: { "分类": [], "作者": [] },
            })
        },

        loadEp: async (comicId, epId) => {
            let url = this.url + "lcmh-" + comicId + "-" + epId + "/"
            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let images = this.extractImages(res.body)

            return {
                images: images
            }
        },

        onImageLoad: (url, comicId, epId) => {
            return {
                headers: {
                    "Referer": "https://lcmhx.cc/"
                }
            }
        },

        onThumbnailLoad: (url) => {
            return {
                headers: {
                    "Referer": "https://lcmhx.cc/"
                }
            }
        },
    }
}
