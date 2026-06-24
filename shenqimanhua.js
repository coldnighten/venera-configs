/** @type {import('./_venera_.js')} */
class ShenQiManHua extends ComicSource {
  name = "神奇漫画";

  key = "shenqimanhua";

  version = "1.1.0";

  minAppVersion = "1.6.0";

  url = "https://shenqimanhua.cc/";

  baseUrl = "https://shenqimanhua.cc";

  async getHtml(url) {
    let headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    };
    let res = await Network.get(url, headers);
    if (res.status !== 200) {
      throw "Invalid status code: " + res.status;
    }
    let document = new HtmlDocument(res.body);
    return document;
  }

  parseComicCard(linkElement) {
    if (!linkElement) return null;

    let href = linkElement.attributes["href"] || "";
    if (!href.includes("/comic/")) return null;

    let id = href.split("/comic/").pop().replace(/\/$/, "");
    if (!id) return null;

    let img = linkElement.querySelector("img");
    let title = "";
    let cover = "";

    if (img) {
      let alt = img.attributes["alt"] || "";
      if (alt.startsWith("《") && alt.endsWith("》封面")) {
        title = alt.slice(1, -3);
      }
      cover = img.attributes["src"] || img.attributes["data-src"] || "";
      if (cover && cover.startsWith("/")) {
        cover = this.baseUrl + cover;
      }
    }

    if (!title) {
      title = linkElement.text.trim();
    }

    return new Comic({
      id: id,
      title: title,
      cover: cover,
    });
  }

  explore = [
    {
      title: "神奇漫画",
      type: "multiPartPage",
      load: async (page) => {
        let document = await this.getHtml(this.baseUrl + "/");
        let parts = [];

        let grids = document.querySelectorAll(".grid.grid-cols-3");
        let headings = document.querySelectorAll("h1, h2");

        let headingTexts = [];
        for (let h of headings) {
          let text = h.text.trim();
          if (text) {
            headingTexts.push(text);
          }
        }

        // 区块对应的 viewMore 配置
        // 格式: { sort: "latest|total", tag: "标签名", theme: "theme ID" }
        let blockConfigs = [
          { sort: "latest", tag: "", theme: "" },  // 抢先更新
          { sort: "total", tag: "", theme: "" },   // 热门漫画
          { tag: "热血", theme: "cmigxh0xk0004dsopw3n53al1" },  // 热血冒险
          { tag: "宫廷", theme: "cmj2d34jy0000b4ovobi8kx7w" },  // 宫廷穿越
          { tag: "3d", theme: "cmj2dz7ie0001b4ovpz014eq4" },     // 3d漫画
          { tag: "奇幻", theme: "cmigxhd5l0005dsop2l6axogz" },  // 奇幻魔法
          { tag: "治愈", theme: "cmigxhtri0006dsopb97ti6zn" },   // 轻松治愈
          { tag: "校园", theme: "cmigxicdg0008dsopt2563ct3" },   // 校园青春
        ];

        for (let i = 0; i < grids.length; i++) {
          let grid = grids[i];
          let title = headingTexts[i] || ("区块 " + (i + 1));

          let links = grid.querySelectorAll("a[href*='/comic/']");
          let comics = [];

          for (let link of links) {
            let comic = this.parseComicCard(link);
            if (comic) {
              comics.push(comic);
            }
          }

          if (comics.length > 0) {
            let part = { title: title, comics: comics };

            // 添加 viewMore
            let config = blockConfigs[i];
            if (config) {
              if (config.sort) {
                // 纯排序模式：全部漫画 + 指定排序
                part.viewMore = {
                  page: "category",
                  attributes: {
                    category: "全部",
                    param: "sort:" + config.sort,
                  },
                };
              } else if (config.theme) {
                // 专题模式：跳转到专题页
                part.viewMore = {
                  page: "category",
                  attributes: {
                    category: title,
                    param: "theme:" + config.theme,
                  },
                };
              }
            }

            parts.push(part);
          }
        }

        document.dispose();
        return parts;
      },
      loadNext(next) {},
    },
  ];

  category = {
    title: "神奇漫画",
    parts: [
      {
        name: "分类",
        type: "fixed",
        categories: [
          "全部", "复仇", "奇幻", "宫廷", "幻想", "恋爱",
          "悬疑", "暗黑", "校园", "欲望", "武侠", "治愈",
          "热血", "禁忌", "科幻", "穿越", "轻松", "进阶",
          "逆袭", "都市"
        ],
        categoryParams: [
          "", "复仇", "奇幻", "宫廷", "幻想", "恋爱",
          "悬疑", "暗黑", "校园", "欲望", "武侠", "治愈",
          "热血", "禁忌", "科幻", "穿越", "轻松", "进阶",
          "逆袭", "都市"
        ],
        itemType: "category",
      }
    ],
    enableRankingPage: false,
  };

  categoryComics = {
    load: async (category, param, options, page) => {
      let sort = options[0] || "total";
      let url = "";
      let isThemePage = false;

      // param 有三种格式：
      // 1. sort:xxx - 纯排序模式，显示全部漫画 + 指定排序
      // 2. theme:xxx - 专题模式，跳转到专题页
      // 3. 其他 - 普通分类模式，按 tag 筛选

      if (param && param.startsWith("sort:")) {
        // sort 模式
        let sortValue = param.replace("sort:", "");
        url = `${this.baseUrl}/comics?sort=${sortValue}&page=${page}`;
      } else if (param && param.startsWith("theme:")) {
        // theme 模式
        let themeId = param.replace("theme:", "");
        url = `${this.baseUrl}/theme?id=${themeId}&page=${page}`;
        isThemePage = true;
      } else {
        // 普通分类模式
        let tag = param || "";
        if (tag) {
          url = `${this.baseUrl}/comics?tag=${encodeURIComponent(tag)}&sort=${sort}&page=${page}`;
        } else {
          url = `${this.baseUrl}/comics?sort=${sort}&page=${page}`;
        }
      }

      let document = await this.getHtml(url);

      let comics = [];
      let grid = document.querySelector(".grid.grid-cols-3");
      if (grid) {
        let links = grid.querySelectorAll("a[href*='/comic/']");
        for (let link of links) {
          let comic = this.parseComicCard(link);
          if (comic) {
            comics.push(comic);
          }
        }
      }

      let maxPage = 1;
      let pageLinks = document.querySelectorAll("a[href*='page=']");
      for (let link of pageLinks) {
        let href = link.attributes["href"] || "";
        let match = href.match(/page=(\d+)/);
        if (match) {
          let num = parseInt(match[1]);
          if (num > maxPage) {
            maxPage = num;
          }
        }
      }

      // 如果是专题页，尝试从 URL 或标题中获取更多分页信息
      if (isThemePage && maxPage === 1) {
        // 检查是否有其他分页模式
        let pagination = document.querySelectorAll("button[disabled], button");
        for (let btn of pagination) {
          let text = btn.text.trim();
          if (text && /\d+/.test(text)) {
            let nums = text.match(/\d+/g);
            if (nums && nums.length > 0) {
              let max = Math.max(...nums.map(n => parseInt(n)));
              if (max > maxPage) {
                maxPage = max;
              }
            }
          }
        }
      }

      document.dispose();
      return {
        comics: comics,
        maxPage: maxPage
      };
    },
    optionList: [
      {
        options: ["total-最热", "latest-最新"],
      },
    ],
  };

  search = {
    load: async (keyword, options, page) => {
      let encodedKeyword = encodeURIComponent(keyword);
      let url = `${this.baseUrl}/search?q=${encodedKeyword}&page=${page}`;

      let document = await this.getHtml(url);

      let comics = [];
      let grid = document.querySelector(".grid.grid-cols-3");
      if (grid) {
        let links = grid.querySelectorAll("a[href*='/comic/']");
        for (let link of links) {
          let comic = this.parseComicCard(link);
          if (comic) {
            comics.push(comic);
          }
        }
      }

      let maxPage = 1;
      let pageLinks = document.querySelectorAll("a[href*='page=']");
      for (let link of pageLinks) {
        let href = link.attributes["href"] || "";
        let match = href.match(/page=(\d+)/);
        if (match) {
          let num = parseInt(match[1]);
          if (num > maxPage) {
            maxPage = num;
          }
        }
      }

      document.dispose();
      return {
        comics: comics,
        maxPage: maxPage
      };
    },
    enableTagsSuggestions: false,
  };

  comic = {
    loadInfo: async (id) => {
      let url = `${this.baseUrl}/comic/${id}`;
      let res = await Network.get(url, {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      });
      if (res.status !== 200) {
        throw "Invalid status code: " + res.status;
      }

      let html = res.body;
      let document = new HtmlDocument(html);

      let title = "";
      let cover = "";
      let description = "";
      let author = "";
      let tags = [];
      let updateTime = "";

      let titleElement = document.querySelector("h1");
      if (titleElement) {
        title = titleElement.text.trim();
      }

      let ogImage = document.querySelector("meta[property='og:image']");
      if (ogImage) {
        cover = ogImage.attributes["content"] || "";
      }

      let ogDesc = document.querySelector("meta[property='og:description']");
      if (ogDesc) {
        description = ogDesc.attributes["content"] || "";
      }

      let chapterPattern = /\{\\"id\\":\\"(cm[a-z0-9]+)\\",\\"title\\":\\"([^\\"]+)\\",\\"number\\":(\d+),\\"createdAt\\":\\"[^\\"]*\\"/g;
      let chapters = new Map();
      let chapterList = [];
      let match;

      while ((match = chapterPattern.exec(html)) !== null) {
        let chId = match[1];
        let chTitle = match[2];
        let chNumber = parseInt(match[3]);
        chapterList.push({ id: chId, title: chTitle, number: chNumber });
      }

      chapterList.sort((a, b) => a.number - b.number);

      for (let ch of chapterList) {
        chapters.set(ch.id, ch.title);
      }

      let authorPattern = /"author":\{"@type":"Person","name":"([^"]+)"\}/;
      let authorMatch = html.match(authorPattern);
      if (authorMatch) {
        author = authorMatch[1];
      }

      let genrePattern = /"genre":\[([^\]]+)\]/;
      let genreMatch = html.match(genrePattern);
      if (genreMatch) {
        let genreStr = genreMatch[1];
        let genreMatches = genreStr.match(/"([^"]+)"/g);
        if (genreMatches) {
          tags = genreMatches.map(g => g.replace(/"/g, ""));
        }
      }

      if (!title) {
        let namePattern = /"name":"([^"]+)","url":"https:\/\/shenqimanhua\.cc\/comic\//;
        let nameMatch = html.match(namePattern);
        if (nameMatch) {
          title = nameMatch[1];
        }
      }

      document.dispose();

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
      });
    },

    loadEp: async (comicId, epId) => {
      let url = `${this.baseUrl}/read/${comicId}/${epId}`;
      let document = await this.getHtml(url);

      let images = [];
      let imgs = document.querySelectorAll("img[src*='/image/']");

      for (let img of imgs) {
        let src = img.attributes["src"] || "";
        if (src && src.includes("/img/") && (src.endsWith(".webp") || src.endsWith(".jpg") || src.endsWith(".png"))) {
          if (src.startsWith("/")) {
            src = this.baseUrl + src;
          }
          images.push(src);
        }
      }

      if (images.length === 0) {
        let imgElements = document.querySelectorAll("img");
        for (let img of imgElements) {
          let alt = img.attributes["alt"] || "";
          if (alt.includes("第") && alt.includes("张图")) {
            let src = img.attributes["src"] || "";
            if (src) {
              if (src.startsWith("/")) {
                src = this.baseUrl + src;
              }
              images.push(src);
            }
          }
        }
      }

      document.dispose();
      return {
        images: images
      };
    },

    onImageLoad: (url, comicId, epId) => {
      return {
        headers: {
          "Referer": "https://shenqimanhua.cc/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }
      };
    },
  };
}
