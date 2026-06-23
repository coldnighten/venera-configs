/** @type {import('./_venera_.js')} */

class Mhua5漫画 extends ComicSource {
    name = "Mhua5漫画"
    key = "mhua5"
    version = "1.0.0"
    minAppVersion = "1.6.0"
    url = "https://www.mhua5.com/"

        explore = [
        {
            title: "推荐",
            type: "multiPartPage",
            load: async (page) => {
                let res = await Network.get("https://www.mhua5.com")
                if (res.status !== 200) throw "请求失败"
                let document = new HtmlDocument(res.body)
                let comics = []
                document.querySelectorAll("li.comic-item").forEach(el => {
                    comics.push(new Comic({
                        id: el.getAttribute("href"),
                        title: el.querySelector("a")?.text || "",
                        cover: el.querySelector("img")?.getAttribute("src") || "",
                    }))
                })
                return { "recommend": comics }
            }
        }
    ]


    {{SEARCH_SECTION}}

    {{CATEGORY_SECTION}}

    {{COMIC_SECTION}}
}