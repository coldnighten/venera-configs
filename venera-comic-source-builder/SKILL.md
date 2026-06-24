---
name: venera-comic-source-builder
description: 全自动创建Venera漫画源，采用TDD测试驱动开发流程，分步引导用户输入信息，每一步先测试验证再实现，确保生成的漫画源完全可用。当用户提到创建漫画源、开发漫画源、编写漫画源规则、生成漫画源时，必须使用此技能。
---

# Venera 漫画源构建器

采用测试驱动开发(TDD)流程，分步引导用户完成漫画源的创建，确保每一步都经过验证，避免常见错误。

## 工作流程总览

```
阶段1: 收集信息 → 阶段2: 探索页 → 阶段3: 分类页 → 阶段4: 搜索页 
→ 阶段5: 详情页 → 阶段6: 章节页 → 阶段7: 整合验证
```

## 阶段1：收集基本信息

需要收集的信息：漫画源名称、唯一标识符(key)、版本号、基础网址、最低APP版本。

创建源文件的基础框架（类定义 + 基本属性）。

---

## 阶段2：探索页开发

### 分析页面结构
使用 `scripts/analyze_page.py list <URL>` 分析页面结构，识别漫画列表容器、卡片结构、封面图片选择器、标题链接选择器。

### 检查"更多"按钮
**务必检查每个区块是否有"更多/查看更多"按钮。** 如果有，必须添加 `viewMore` 字段，否则按钮点击无效。

检查内容：
1. 找到每个区块的标题区域旁边的"更多"链接
2. 确认链接指向的页面类型（分类页、专题页、搜索页等）
3. 提取对应的参数（tag、theme id、sort 等）

### viewMore 说明
`viewMore` 是 `multiPartPage` 类型探索页每个区块的可选字段，类型为 `PageJumpTarget`，点击"更多"按钮时会跳转到指定页面。

```javascript
// 标准格式（推荐）
{
    title: "区块标题",
    comics: [...],
    viewMore: {
        page: "category",  // 或 "search"
        attributes: {
            category: "分类名称",
            param: "传递给 categoryComics.load 的参数",
        }
    }
}
```

**常见的"更多"按钮类型：**

| 类型 | 说明 | viewMore 配置 |
|------|------|--------------|
| 分类页（tag筛选） | 跳转到 `/comics?tag=xxx` | `page: "category", param: "tag名"` |
| 专题页 | 跳转到 `/theme?id=xxx` | `page: "category", param: "theme:id"` |
| 纯排序 | 全部漫画按排序展示 | `page: "category", param: "sort:latest"` |
| 搜索结果 | 跳转到搜索页 | `page: "search", keyword: "关键词"` |

### 验证标准
- 至少能提取出3个漫画
- 每个漫画都有 id、title、cover
- ID 格式正确（非空字符串）
- 封面URL是完整URL或可拼接的相对路径
- **有"更多"按钮的区块必须添加 viewMore**
- **viewMore 格式正确（对象格式，含 page 和 attributes）**

### 类型选择
- `multiPartPage` - 多个推荐区块，返回 `[{title, comics, viewMore?}, ...]`
- `singlePageWithMultiPart` - 多部分单页，返回 `{section1: [...], ...}`
- `multiPageComicList` - 分页漫画列表，返回 `{comics, maxPage}`

### 关键要求
- ✅ 标题必须与 `name` 一致
- ✅ 使用 `new HtmlDocument(res.body)`
- ✅ 漫画使用 `new Comic({id, title, cover})`
- ✅ 解析后调用 `document.dispose()`
- ✅ 有"更多"按钮必须配 viewMore

详细模板见 [references/templates.md](references/templates.md)

---

## 阶段3：分类页开发

### 分析分类结构
分析分类标签的HTML结构，提取所有分类名称和对应的链接/参数，确认分类参数的URL格式。

### 验证标准
1. 分类列表完整
2. 每个分类的参数正确
3. 分类漫画列表解析正确

### 分类配置
```javascript
category = {
    title: "与name一致",
    parts: [{
        name: "分类",
        type: "fixed",
        categories: ["全部", ...],
        categoryParams: ["", ...],
        itemType: "category",
    }],
    enableRankingPage: false,
}
```

### 分类漫画加载
返回格式：`{comics: Comic[], maxPage: number}`

详细模板见 [references/templates.md](references/templates.md)

---

## 阶段4：搜索页开发

### 分析搜索结构
分析搜索参数的格式、搜索结果页面结构、确认分页方式。

### 验证标准
1. 搜索URL格式正确
2. 关键词正确编码 `encodeURIComponent`
3. 搜索结果解析正确

### 搜索配置
```javascript
search = {
    load: async (keyword, options, page) => {
        // 构造搜索URL
        // 解析搜索结果
        // 返回 {comics, maxPage}
    },
    enableTagsSuggestions: false,
}
```

详细模板见 [references/templates.md](references/templates.md)

---

## 阶段5：详情页开发

### ⚠️ 常见陷阱

1. **标签提取错误** - 提取到"作者/标签/更新"文字，而不是实际值
2. **章节只有部分** - 页面初始只渲染24章，需要API获取完整列表
3. **章节倒序** - API返回的章节是倒序，最新章节在前

### 必须检查的元素

**基本信息提取**：
- 漫画标题、封面图片、简介

**标签/作者提取**：
- 根据实际HTML结构选择正确方式（直接选择器或根据文本前缀区分）

**章节列表提取**：
- 检查是否只有部分章节
- 检查是否有API获取完整列表

### 验证标准
1. ✅ 标题提取正确（非空）
2. ✅ 封面URL正确（完整URL）
3. ✅ 作者/标签提取正确
4. ✅ 章节数量完整
5. ✅ 章节顺序正确（第1话在前）
6. ✅ tags 格式：对象 `{作者: [...], 标签: [...]}`
7. ✅ chapters 格式：Map

### 绝对禁止的错误
- ❌ `new Document()` → 必须用 `new HtmlDocument()`
- ❌ `chapters: [...]` → 必须是 `Map`
- ❌ `tags: [...]` → 必须是对象 `{作者: [...], 标签: [...]}`
- ❌ `author: author` → 作者应放在 tags 里

详细模板见 [references/templates.md](references/templates.md)

---

## 阶段6：章节图片开发

### ⚠️ 常见陷阱：图片列表为空导致阅读器崩溃

**错误表现**：`Invalid argument(s): 1` at `int.clamp`

### 分析章节页图片加载方式

**必须先查看页面源码，不要只看 DOM 结构！**

1. **检查是否为 JS 动态生成**
   - 搜索 `var num`、`var total`、`var pasd`、`var imgPath` 等变量

2. **检查 DOM 结构**
   - 图片容器选择器
   - 懒加载属性（`data-src`、`data-original`）

3. **检查特殊需求**
   - 是否需要 Referer 头（防盗链）
   - 图片 URL 是否需要补全

### 验证标准
1. ✅ 图片数量 > 0
2. ✅ 图片 URL 完整可用
3. ✅ 没有广告图混入
4. ✅ 图片 URL 格式正确

### Referer 设置
```javascript
onImageLoad: (url, comicId, epId) => {
    return {
        headers: {
            "Referer": this.url,
        }
    }
}
```

### 常见图片加载模式

| 模式 | 特征 | 提取方法 |
|------|------|---------|
| **JS动态生成** | `var num` + `var path` | 正则提取 + 循环生成 |
| **懒加载** | `data-src` / `data-original` | 取 data-* 属性 |
| **直接img** | `<img src="...">` | 取 src 属性 |
| **加密/混淆** | Base64编码、JS解密 | 分析解密逻辑 |

详细模板见 [references/templates.md](references/templates.md)

---

## 阶段7：整合与最终验证

### 使用脚本自动检查
```bash
python3 scripts/validate_source.py <源文件路径>
```

### 手动检查项

**通用检查**：
- [ ] 使用 `new HtmlDocument()`
- [ ] 解析后调用 `dispose()`
- [ ] 检查状态码

**探索页专项**：
- [ ] 每个有"更多"按钮的区块都添加了 viewMore
- [ ] viewMore 格式正确（page + attributes）
- [ ] viewMore 跳转目标正确

**详情页专项**：
- [ ] 作者/标签提取正确
- [ ] 章节数量完整
- [ ] chapters 是 Map 格式
- [ ] tags 是对象格式

**章节图片专项**：
- [ ] loadEp 返回的 images 数组不为空
- [ ] 图片 URL 完整
- [ ] 设置了 onImageLoad（如需要 Referer）

完整检查清单见 [references/checklist.md](references/checklist.md)

---

## 错误速查

详细错误列表见 [references/errors.md](references/errors.md)

常见错误：
- `ReferenceError: Document is not defined` → 改为 `new HtmlDocument()`
- `loadEp 返回空数组` → 检查图片提取逻辑
- `图片加载403` → 设置 `onImageLoad` 返回 headers

---

## 辅助工具

| 脚本 | 用途 |
|------|------|
| `scripts/analyze_page.py` | 自动分析页面结构 |
| `scripts/validate_source.py` | 自动检查源代码错误 |
| `scripts/manage_index.py` | 管理 index.json 索引文件 |

### manage_index.py 使用
```bash
# 检查 index.json 格式
python scripts/manage_index.py check <index.json路径>

# 添加新条目
python scripts/manage_index.py add <index.json路径> <name> <fileName> <key> <version> [description]
```

---

## 工作原则

1. **TDD优先**：每一步先测试验证，再实现代码
2. **分步进行**：一次只处理一个功能模块
3. **用户确认**：每个阶段完成后确认再继续
4. **主动分析**：使用Python脚本辅助分析
5. **错误预防**：严格遵守格式规范

---

## 参考文件

- [references/templates.md](references/templates.md) - 详细代码模板
- [references/errors.md](references/errors.md) - 错误速查表
- [references/checklist.md](references/checklist.md) - 完整检查清单
- [references/source_template.js](references/source_template.js) - 源代码模板
- [references/test_template.py](references/test_template.py) - 测试脚本模板
