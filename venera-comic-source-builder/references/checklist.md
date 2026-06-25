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

## 登录功能检查

- [ ] `account.login` 函数存在且返回 "ok"
- [ ] 登录 API 正确调用，参数正确编码
- [ ] 响应验证正确（检查 code 字段）
- [ ] Cookies 正确提取并保存
- [ ] `account.logout` 正确清除 cookies
- [ ] `account.registerWebsite` 提供注册页面 URL
- [ ] `isLogged` 属性正确检查登录状态

## 收藏功能检查

- [ ] `favorites.multiFolder` 设置正确（false=单文件夹, true=多文件夹）
- [ ] `addOrDelFavorite` 参数使用正确：
  - comicId：漫画 ID（可能是 slug 或数字 ID）
  - isAdding：true=添加, false=删除
- [ ] **双重 ID 处理**：
  - 如果网站使用 slug 作为 URL 但 API 需要数字 ID
  - 必须实现 ID 缓存机制
  - 在 `loadInfo` 中提取并缓存数字 ID
  - 在 `addOrDelFavorite` 中调用 `ensureNumericId()` 转换 ID
- [ ] `loadComics` 返回格式：`{comics: [...], maxPage: number}`
- [ ] 收藏列表中的漫画正确缓存 ID 映射
- [ ] 未登录时抛出 "Login expired"

## 图片防盗链检查

- [ ] 设置了 `onImageLoad`（章节图片防盗链）
- [ ] 设置了 `onThumbnailLoad`（封面图片防盗链）
- [ ] Referer 设置为网站根 URL

## 命名规范

- [ ] 类名：大驼峰，如 `Manhua5Source`
- [ ] 文件名：全小写，如 `manhua5.js`
- [ ] key：全小写英文，无空格
- [ ] name：用户指定的中文名
