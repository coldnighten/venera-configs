/** @type {import('./_venera_.js')} */

class Manhua5Source extends ComicSource {
    name = "漫画屋"
    key = "manhua5"
    version = "1.0.0"
    minAppVersion = "1.6.0"
    url = "https://www.mhua5.com/"

    explore = [
        {
            title: "精品推荐",
            type: "multiPartPage",
            load: async (page) => {
                let res = await Network.get(this.url)

                if (res.status !== 200) {
                    throw `Invalid status code: ${res.status}`
                }

                let soup = new Document(res.body)

                function parseComic(elem) {
                    let img = elem.querySelector('img.lazy')
                    let titleElem = elem.querySelector('p.comic__title')
                    let titleLink = titleElem ? titleElem.querySelector('a') : null

                    let id = null
                    if (titleLink) {
                        let href = titleLink.getAttribute('href') || ''
                        let parts = href.split('/comic/')
                        if (parts.length > 1) {
                            id = parts[parts.length - 1]
                        }
                    }

                    let title = titleLink ? titleLink.textContent.trim() : ''
                    let cover = img ? (img.getAttribute('data-original') || img.getAttribute('src')) : ''

                    return new Comic({
                        id: id,
                        title: title,
                        cover: cover,
                    })
                }

                let result = {}

                // 查找所有区块
                let sections = soup.querySelectorAll('div.in-sec-wr')

                for (let sec of sections) {
                    let title = ''
                    let firstElem = sec.querySelector('h2, h3, strong, span, a')
                    if (firstElem) {
                        title = firstElem.textContent.trim()
                    }
                    if (!title || title.length < 2) {
                        title = '精品推荐'
                    }

                    let comics = []

                    // 大推荐漫画
                    let big = sec.querySelector('div.in-fine__big')
                    if (big) {
                        comics.push(parseComic(big))
                    }

                    // Type-A 漫画
                    let typeA = sec.querySelectorAll('div.in-comic--type-a')
                    for (let t of typeA) {
                        comics.push(parseComic(t))
                    }

                    // Type-B 漫画
                    let typeB = sec.querySelectorAll('div.in-comic--type-b')
                    for (let t of typeB) {
                        comics.push(parseComic(t))
                    }

                    if (comics.length > 0) {
                        result[title] = comics
                    }
                }

                return result
            }
        }
    ]
}
