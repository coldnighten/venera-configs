# 漫画源代码检查清单

在完成每个功能模块后，使用此清单进行自检。

## 通用检查

- [ ] 使用 `new HtmlDocument()` 而不是 `new Document()`
- [ ] 使用 `.text` 而不是 `.textContent`
- [ ] 使用 `.attributes['xxx']` 而不是 `.getAttribute('xxx')`
- [ ] 网络请求检查状态码 `res.status !== 200`
- [ ] 解析完成后调用 `document.dispose()`

## 探索页检查

- [ ] `explore[0].title` 与 `name` 完全一致
- [ ] `multiPartPage` 类型返回数组格式：`[{title, comics}, ...]`
- [ ] `singlePageWithMultiPart` 类型返回对象格式：`{section1: [...], section2: [...]}`
- [ ] 每个漫画项使用 `new Comic({id, title, cover})`
- [ ] 漫画ID从链接中正确提取
- [ ] **有"更多"按钮的区块是否添加了 viewMore**
- [ ] **viewMore 格式正确**：对象格式 `{ page: "category|search", attributes: {...} }`
- [ ] **viewMore.page 合法**：只能是 "category" 或 "search"
- [ ] **跳转到分类页时 attributes 包含 category 和 param**
- [ ] **跳转到搜索页时 attributes 包含 keyword**

## 分类页检查

- [ ] `category.title` 与 `name` 完全一致
- [ ] 分类列表完整
- [ ] `categoryParams` 数量与 `categories` 一致
- [ ] `itemType` 设置正确（"category" 或 "search"）

## 分类漫画加载检查

- [ ] 返回格式：`{comics: [...], maxPage: number}`
- [ ] `maxPage` 正确计算

## 搜索页检查

- [ ] 关键词正确编码：`encodeURIComponent(keyword)`
- [ ] 返回格式：`{comics: [...], maxPage: number}`
- [ ] 分页参数正确

## 详情页检查（最容易出错！）

- [ ] `chapters` 是 `Map<string, string>` 类型
- [ ] 使用 `chapters.set(id, title)` 添加章节
- [ ] `tags` 是对象格式：`{作者: [...], 标签: [...]}`
- [ ] 没有错误参数：`id`, `author`, `status`, `isMultiEp`
- [ ] `ComicDetails` 参数正确：
  - title ✅
  - cover ✅
  - description ✅
  - tags (对象) ✅
  - chapters (Map) ✅
  - updateTime ✅
  - recommend (可选) ✅
  - subtitle (可选) ✅

## 章节图片检查

- [ ] 返回格式：`{images: [...]}`
- [ ] 图片URL完整（包含协议头）
- [ ] 支持多种图片格式：jpg, png, webp 等
- [ ] 过滤非漫画图片（logo、图标等）

## 命名规范

- [ ] 类名：大驼峰，如 `Manhua5Source`
- [ ] 文件名：全小写，如 `manhua5.js`
- [ ] key：全小写英文，无空格
- [ ] name：用户指定的中文名
