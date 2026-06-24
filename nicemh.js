/** @type {import('./_venera_.js')} */

class NiceMhSource extends ComicSource {
    name = "奈斯漫画"
    key = "nicemh"
    version = "1.0.0"
    minAppVersion = "1.6.0"
    url = "https://m.nicemh.com/"

    explore = [
        {
            title: "奈斯漫画",
            type: "multiPartPage",
            load: async (page) => {
                let res = await Network.get(this.url)

                if (res.status !== 200) {
                    throw `Invalid status code: ${res.status}`
                }

                let document = new HtmlDocument(res.body)
                let result = []

                let boxes = document.querySelectorAll(".box")
                for (let box of boxes) {
                    let titleElem = box.querySelector(".hd .title")
                    if (!titleElem) continue

                    let sectionTitle = titleElem.text.trim()
                    if (!sectionTitle) continue

                    let comics = []
                    let items = box.querySelectorAll(".bd .item")

                    for (let item of items) {
                        let link = item.querySelector("a.lazy")
                        if (!link) continue

                        let href = link.attributes["href"] || ""
                        let titleDiv = link.querySelector(".title")
                        let title = titleDiv ? titleDiv.text.trim() : ""
                        let cover = link.attributes["data-original"] || ""

                        let id = ""
                        if (href.indexOf("/manhua/") >= 0) {
                            let parts = href.split("/manhua/")
                            if (parts.length > 1) {
                                id = parts[parts.length - 1].replace(/\/$/, "")
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

                    if (comics.length > 0) {
                        result.push({ title: sectionTitle, comics: comics })
                    }
                }

                document.dispose()
                return result
            }
        }
    ]

    category = {
        title: "奈斯漫画",
        parts: [
            {
                name: "题材",
                type: "fixed",
                categories: [
                    "全部", "热血", "仙侠", "玄幻", "都市", "冒险", "武侠", "格斗", "科幻", "异能",
                    "重生", "推理", "悬疑", "竞技", "搞笑", "恐怖", "生活", "校园", "恋爱", "百合",
                    "耽美", "二次元", "萌系", "伪娘", "历史", "战争", "剧情", "唯美", "奇幻", "治愈",
                    "少女", "古风", "高甜", "动作", "穿越", "复仇", "魔幻", "励志", "后宫", "爱情",
                    "青春", "机甲", "战斗", "灵异", "运动", "职场", "总裁", "宫斗", "科技", "浪漫",
                    "末日", "大女主", "系统", "暗黑", "正能量", "魔法", "脑洞", "少年", "幻想", "宫廷"
                ],
                categoryParams: [
                    "", "rexue", "xianxia", "xuanhuan", "dushi", "maoxian", "wuxia", "gedou", "kehuan", "yineng",
                    "chongsheng", "tuili", "xuanyi", "jingji", "gaoxiao", "kongbu", "shenghuo", "xiaoyuan", "lianai", "baihe",
                    "danmei", "erciyuan", "mengxi", "weiniang", "lishi", "zhanzheng", "juqing", "weimei", "qihuan", "zhiyu",
                    "shaonv", "gufeng", "gaotian", "dongzuo", "chuanyue", "fuchou", "mohuan", "lizhi", "hougong", "aiqing",
                    "qingchun", "jijia", "zhandou", "lingyi", "yundong", "zhichang", "zongcai", "gongdou", "keji", "langman",
                    "mori", "danvzhu", "xitong", "anhei", "zhengnengliang", "mofa", "naodong", "shaonian", "huanxiang", "gongting"
                ],
                itemType: "category",
            }
        ],
        enableRankingPage: false,
    }

    categoryComics = {
        load: async (category, param, options, page) => {
            let baseUrl = this.url + "category"
            let url = ""

            if (param && param.length > 0) {
                url = baseUrl + "/theme/" + param
            } else {
                url = baseUrl
            }

            if (page > 1) {
                url = url + "/page/" + page
            }

            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let document = new HtmlDocument(res.body)
            let items = document.querySelectorAll(".comic-items.category-rows .item")

            let comics = []
            for (let item of items) {
                let link = item.querySelector("a.main")
                if (!link) continue

                let href = link.attributes["href"] || ""
                let titleDiv = link.querySelector(".body .title")
                let title = titleDiv ? titleDiv.text.trim() : ""

                let thumb = link.querySelector(".thumbnail.lazy")
                let cover = thumb ? (thumb.attributes["data-original"] || "") : ""

                let id = ""
                if (href.indexOf("/manhua/") >= 0) {
                    let parts = href.split("/manhua/")
                    if (parts.length > 1) {
                        id = parts[parts.length - 1].replace(/\/$/, "")
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

            let maxPage = 1
            let pageInfo = document.querySelector(".pages .num")
            if (pageInfo) {
                let text = pageInfo.text.trim()
                let match = text.match(/\/(\d+)/)
                if (match) {
                    maxPage = parseInt(match[1])
                }
            }

            document.dispose()
            return {
                comics: comics,
                maxPage: maxPage
            }
        },
        optionList: [
            {
                label: "排序",
                options: [
                    "views-热门人气",
                    "update-更新时间"
                ],
            }
        ]
    }

    search = {
        load: async (keyword, options, page) => {
            return { comics: [], maxPage: 1 }
        },
        enableTagsSuggestions: false,
    }

    comic = {
        onImageLoad: (url, comicId, epId) => {
            return {
                headers: {
                    "Referer": this.url,
                }
            }
        },

        loadInfo: async (id) => {
            let url = this.url + "manhua/" + id
            let res = await Network.get(url)

            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let document = new HtmlDocument(res.body)

            let titleElem = document.querySelector("h1.title")
            let title = titleElem ? titleElem.text.trim() : ""

            let coverElem = document.querySelector(".comic-hero img.bg")
            let cover = coverElem ? (coverElem.attributes["src"] || "") : ""

            let descElem = document.querySelector(".comic-container .detail")
            let description = descElem ? descElem.text.trim() : ""

            let author = ""
            let authorElem = document.querySelector(".info .author")
            if (authorElem) {
                let authorText = authorElem.text.trim()
                if (authorText.indexOf("作者：") >= 0) {
                    author = authorText.replace(/^作者[：:]\s*/, "").trim()
                }
            }

            let tags = []
            let tagItems = document.querySelectorAll(".tags .item")
            for (let item of tagItems) {
                let tagText = item.text.trim()
                if (tagText) {
                    tags.push(tagText)
                }
            }

            let updateTime = ""
            let timeElem = document.querySelector(".info .time")
            if (timeElem) {
                let timeText = timeElem.text.trim()
                if (timeText.indexOf("更新时间：") >= 0) {
                    updateTime = timeText.replace(/^更新时间[：:]\s*/, "").trim()
                }
            }

            let chapters = new Map()
            let chapterItems = document.querySelectorAll(".chapter-list .item a")
            for (let item of chapterItems) {
                let href = item.attributes["href"] || ""
                let chTitle = item.text.trim()
                let chId = ""

                let parts = href.replace(/\/$/, "").split("/")
                if (parts.length >= 2) {
                    let last = parts[parts.length - 1]
                    if (last.indexOf(".html") >= 0) {
                        chId = last.substring(0, last.indexOf(".html"))
                    }
                }

                if (chId && chTitle) {
                    chapters.set(chId, chTitle)
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
            let url = this.url + "manhua/" + comicId + "/" + epId + ".html"
            let res = await Network.get(url)

            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let html = res.body

            let paramsMatch = html.match(/var params\s*=\s*'([^']+)'/)
            if (!paramsMatch) {
                throw "未找到加密参数"
            }

            let encryptedParams = paramsMatch[1]

            let encryptedBytes = Utils.decodeBase64(encryptedParams)

            let ivBytes = encryptedBytes.slice(0, 16)
            let cipherBytes = encryptedBytes.slice(16)

            let keyStr = "5V&RoR%Jf@pJPydF"
            let keyBytes = Utils.encodeUtf8(keyStr)

            let decryptedBytes = Utils.decryptAesCbc(cipherBytes, keyBytes, ivBytes)
            let decryptedText = Utils.decodeUtf8(decryptedBytes)
            let data = JSON.parse(decryptedText)

            let images = []
            let imageHost = (data.images_hosts && data.images_hosts.length > 0) ? data.images_hosts[0] : ""

            if (data.chapter_images && data.chapter_images.length > 0) {
                for (let img of data.chapter_images) {
                    if (img.indexOf("http") === 0) {
                        images.push(img)
                    } else if (imageHost) {
                        images.push(imageHost + img)
                    }
                }
            }

            if (images.length === 0) {
                throw "未能提取任何图片，请检查页面结构"
            }

            return {
                images: images
            }
        }
    }
}
