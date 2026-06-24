/** @type {import('./_venera_.js')} */

class Roum27Source extends ComicSource {
    name = "肉漫屋"
    key = "roum27"
    version = "1.0.1"
    minAppVersion = "1.6.0"
    url = "http://roum27.xyz/"

    explore = [
        {
            title: "肉漫屋",
            type: "multiPartPage",
            load: async (page) => {
                let res = await Network.get(this.url + "home")
                if (res.status !== 200) {
                    throw `Invalid status code: ${res.status}`
                }

                let document = new HtmlDocument(res.body)
                let result = []

                let scriptContent = ""
                let scripts = document.querySelectorAll("script")
                for (let script of scripts) {
                    let content = script.text || ""
                    if (content.includes("__next_f")) {
                        scriptContent += content
                    }
                }

                let comicLinks = scriptContent.match(/"href":"\/books\/[^"]*"/g) || []
                let comicImages = scriptContent.match(/"src":"[^"]*\.jpg[^"]*"/g) || []
                let comicTitles = scriptContent.match(/"alt":"[^"]*"/g) || []

                let comics = []
                for (let i = 0; i < comicLinks.length && i < 20; i++) {
                    let href = comicLinks[i].replace('"href":"', '').replace('"', '')
                    let id = href.replace('/books/', '')
                    
                    let cover = ""
                    if (i < comicImages.length) {
                        cover = comicImages[i].replace('"src":"', '').replace('"', '')
                        if (!cover.startsWith('http')) {
                            cover = "http://roum27.xyz" + cover
                        }
                    }

                    let title = ""
                    if (i < comicTitles.length) {
                        title = comicTitles[i].replace('"alt":"', '').replace('"', '')
                    }

                    if (id && title) {
                        comics.push(new Comic({ id, title, cover }))
                    }
                }

                if (comics.length > 0) {
                    result.push({ title: "热门漫画", comics: comics })
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
                name: "分类",
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
            let url = "http://roum27.xyz/books"
            if (param) {
                url += "?lang=" + param
            }
            if (page > 1) {
                url += "&page=" + page
            }

            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let document = new HtmlDocument(res.body)
            let scriptContent = ""
            let scripts = document.querySelectorAll("script")
            for (let script of scripts) {
                let content = script.text || ""
                if (content.includes("__next_f")) {
                    scriptContent += content
                }
            }

            let comicLinks = scriptContent.match(/"href":"\/books\/[^"]*"/g) || []
            let comicImages = scriptContent.match(/"src":"[^"]*\.jpg[^"]*"/g) || []
            let comicTitles = scriptContent.match(/"alt":"[^"]*"/g) || []

            let comics = []
            for (let i = 0; i < comicLinks.length; i++) {
                let href = comicLinks[i].replace('"href":"', '').replace('"', '')
                let id = href.replace('/books/', '')
                
                let cover = ""
                if (i < comicImages.length) {
                    cover = comicImages[i].replace('"src":"', '').replace('"', '')
                    if (!cover.startsWith('http')) {
                        cover = "http://roum27.xyz" + cover
                    }
                }

                let title = ""
                if (i < comicTitles.length) {
                    title = comicTitles[i].replace('"alt":"', '').replace('"', '')
                }

                if (id && title) {
                    comics.push(new Comic({ id, title, cover }))
                }
            }

            document.dispose()
            return {
                comics: comics,
                maxPage: 10
            }
        },
        optionList: [
            {
                options: ["latest-最新", "popular-热门"],
            },
        ],
    }

    search = {
        load: async (keyword, options, page) => {
            let url = "http://roum27.xyz/search?keyword=" + encodeURIComponent(keyword)
            if (page > 1) {
                url += "&page=" + page
            }

            let res = await Network.get(url)
            if (res.status !== 200) {
                throw `Invalid status code: ${res.status}`
            }

            let document = new HtmlDocument(res.body)
            let scriptContent = ""
            let scripts = document.querySelectorAll("script")
            for (let script of scripts) {
                let content = script.text || ""
                if (content.includes("__next_f")) {
                    scriptContent += content
                }
            }

            let comicLinks = scriptContent.match(/"href":"\/books\/[^"]*"/g) || []
            let comicImages = scriptContent.match(/"src":"[^"]*\.jpg[^"]*"/g) || []
            let comicTitles = scriptContent.match(/"alt":"[^"]*"/g) || []

            let comics = []
            for (let i = 0; i < comicLinks.length; i++) {
                let href = comicLinks[i].replace('"href":"', '').replace('"', '')
                let id = href.replace('/books/', '')
                
                let cover = ""
                if (i < comicImages.length) {
                    cover = comicImages[i].replace('"src":"', '').replace('"', '')
                    if (!cover.startsWith('http')) {
                        cover = "http://roum27.xyz" + cover
                    }
                }

                let title = ""
                if (i < comicTitles.length) {
                    title = comicTitles[i].replace('"alt":"', '').replace('"', '')
                }

                if (id && title) {
                    comics.push(new Comic({ id, title, cover }))
                }
            }

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
        let url = "http://roum27.xyz/books/" + id
        let res = await Network.get(url)
        if (res.status !== 200) {
            throw `Invalid status code: ${res.status}`
        }

        let document = new HtmlDocument(res.body)
        let scriptContent = ""
        let scripts = document.querySelectorAll("script")
        for (let script of scripts) {
            let content = script.text || ""
            if (content.includes("__next_f")) {
                scriptContent += content
            }
        }

        let titleMatch = scriptContent.match(/"title":"([^"]+)"/)
        let title = titleMatch ? titleMatch[1] : ""

        let coverMatch = scriptContent.match(/"coverImage":"([^"]+)"/)
        let cover = coverMatch ? coverMatch[1] : ""
        if (cover && !cover.startsWith('http')) {
            cover = "http://roum27.xyz" + cover
        }

        let descMatch = scriptContent.match(/"description":"([^"]+)"/)
        let desc = descMatch ? descMatch[1] : ""

        let chapters = new Map()
        let chapterMatches = scriptContent.match(/{"title":"[^"]+","href":"\/books\/[^"]+\/read\/[^"]+"}/g) || []
        for (let match of chapterMatches) {
            let chapterTitleMatch = match.match(/"title":"([^"]+)"/)
            let chapterHrefMatch = match.match(/"href":"([^"]+)"/)
            if (chapterTitleMatch && chapterHrefMatch) {
                let chapterTitle = chapterTitleMatch[1]
                let chapterId = chapterHrefMatch[1].replace('/books/' + id + '/read/', '')
                chapters.set(chapterId, chapterTitle)
            }
        }

        let tags = { "作者": [], "标签": [] }
        let authorMatch = scriptContent.match(/"author":"([^"]+)"/)
        if (authorMatch) {
            tags["作者"].push(authorMatch[1])
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
        let url = "http://roum27.xyz/books/" + comicId + "/read/" + epId
        let res = await Network.get(url)
        if (res.status !== 200) {
            throw `Invalid status code: ${res.status}`
        }

        let document = new HtmlDocument(res.body)
        let scriptContent = ""
        let scripts = document.querySelectorAll("script")
        for (let script of scripts) {
            let content = script.text || ""
            if (content.includes("__next_f")) {
                scriptContent += content
            }
        }

        let images = []
        let imageMatches = scriptContent.match(/"url":"([^"]+\.(jpg|png|webp))"/g) || []
        for (let match of imageMatches) {
            let urlMatch = match.match(/"url":"([^"]+)"/)
            if (urlMatch) {
                let imgUrl = urlMatch[1]
                if (!imgUrl.startsWith('http')) {
                    imgUrl = "http://roum27.xyz" + imgUrl
                }
                images.push(imgUrl)
            }
        }

        document.dispose()
        return {
            images: images,
            title: ""
        }
    },

    onImageLoad: (url, comicId, epId) => {
        return {
            headers: {
                "Referer": this.url + "books/" + comicId + "/read/" + epId
            }
        }
    },
    }
}