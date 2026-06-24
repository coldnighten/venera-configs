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

每个阶段都遵循 TDD 循环：
```
分析页面结构 → 编写测试验证 → 实现代码 → 确认通过
```

## 阶段1：收集基本信息

**目标**：获取创建漫画源所需的基础配置

### 需要收集的信息

1. **漫画源名称** (name) - 用户看到的显示名称，如"漫画屋"
2. **唯一标识符** (key) - 英文小写，无空格，如"manhua5"
3. **版本号** (version) - 如 "1.0.0"
4. **基础网址** (base url) - 网站首页地址
5. **最低APP版本** - 通常为 "1.6.0"
6. **是否需要登录** - 默认为不需要

### 执行步骤

1. 向用户逐一询问上述信息
2. 确认所有信息无误
3. 创建源文件的基础框架（类定义 + 基本属性）
4. 告知用户进入下一阶段

---

## 阶段2：探索页开发

**目标**：实现探索/发现页面功能

### TDD 步骤1：分析页面结构

1. 让用户提供探索页URL（通常是首页）
2. 使用 `scripts/analyze_page.py list <URL>` 分析页面结构
3. 识别以下元素：
   - 漫画列表容器（class/id）
   - 漫画卡片结构
   - 封面图片选择器
   - 标题链接选择器
   - 是否有多个推荐区块

### TDD 步骤2：编写测试验证

创建 Python 测试脚本验证数据提取：

```python
# 测试点：
# 1. 能否找到漫画列表容器
# 2. 能否正确提取漫画ID（从链接中）
# 3. 能否正确提取标题
# 4. 能否正确提取封面图片URL
# 5. 如果是多区块，能否正确分区
```

验证标准：
- 至少能提取出3个漫画
- 每个漫画都有 id、title、cover
- ID 格式正确（非空字符串）
- 封面URL是完整URL或可拼接的相对路径

### TDD 步骤3：实现代码

测试通过后，实现探索页功能：

**类型选择**：
- `multiPartPage` - 多个推荐区块，返回数组 `[{title, comics}, ...]`
- `singlePageWithMultiPart` - 多部分单页，返回对象 `{section1: [...], ...}`
- `multiPageComicList` - 分页漫画列表，返回 `{comics, maxPage}`

**关键要求**：
- ✅ 标题必须与 `name` 一致
- ✅ 使用 `new HtmlDocument(res.body)`
- ✅ 漫画使用 `new Comic({id, title, cover})`
- ✅ 解析后调用 `document.dispose()`

---

## 阶段3：分类页开发

**目标**：实现分类浏览功能

### TDD 步骤1：分析分类结构

1. 让用户提供分类页URL
2. 分析分类标签的HTML结构
3. 提取所有分类名称和对应的链接/参数
4. 确认分类参数的URL格式

### TDD 步骤2：编写测试验证

测试内容：
1. 分类列表是否完整（数量是否正确）
2. 每个分类的参数是否正确
3. 点击某个分类能否加载漫画列表
4. 分类漫画列表解析是否正确

### TDD 步骤3：实现代码

实现分类配置和分类漫画加载：

**分类配置**：
```javascript
category = {
    title: "与name一致",
    parts: [
        {
            name: "分类",
            type: "fixed",
            categories: ["全部", ...],
            categoryParams: ["", ...],
            itemType: "category",
        }
    ],
    enableRankingPage: false,
}
```

**分类漫画加载**：
- 返回格式：`{comics: Comic[], maxPage: number}`
- 正确处理分页

---

## 阶段4：搜索页开发

**目标**：实现搜索功能

### TDD 步骤1：分析搜索结构

1. 让用户提供搜索URL示例（搜索某个关键词的结果页）
2. 分析搜索参数的格式
3. 分析搜索结果页面结构
4. 确认分页方式

### TDD 步骤2：编写测试验证

测试内容：
1. 搜索URL格式是否正确
2. 关键词是否正确编码 `encodeURIComponent`
3. 搜索结果解析是否正确
4. 分页参数是否正确
5. 无结果时是否正常处理

### TDD 步骤3：实现代码

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

---

## 阶段5：详情页开发（最容易出错！）

**目标**：实现漫画详情页功能

### TDD 步骤1：分析详情页结构

1. 让用户提供一个具体的漫画详情页URL
2. 分析以下元素：
   - 漫画标题
   - 封面图片
   - 作者信息
   - 简介/描述
   - 标签/分类
   - 章节列表（容器、每项结构）
   - 更新时间

### TDD 步骤2：编写测试验证

**重点测试项**：

1. ✅ 标题提取正确
2. ✅ 封面URL正确
3. ✅ 作者提取正确
4. ✅ 简介提取正确
5. ✅ 标签提取正确
6. ✅ **章节格式：Map<string, string>**（最易错！）
7. ✅ **tags 格式：对象格式** `{作者: [...], 标签: [...]}`
8. ✅ 章节ID能从链接中正确提取

### TDD 步骤3：实现代码

**严格遵守以下格式**：

```javascript
comic = {
    loadInfo: async (id) => {
        let document = new HtmlDocument(res.body)
        
        // 提取信息...
        
        // 章节必须是 Map！
        let chapters = new Map()
        for (let item of chapterItems) {
            let chId = ...
            let chTitle = ...
            chapters.set(chId, chTitle)
        }
        
        document.dispose()
        
        return new ComicDetails({
            title: title,
            cover: cover,
            description: description,
            tags: {           // 对象格式！
                作者: [author],
                标签: tags,
            },
            chapters: chapters,  // Map格式！
            updateTime: updateTime,
        })
    }
}
```

**绝对禁止的错误**：
- ❌ `new Document()` → 必须用 `new HtmlDocument()`
- ❌ `chapters: [...]` → 必须是 `Map`
- ❌ `tags: [...]` → 必须是对象 `{作者: [...], 标签: [...]}`
- ❌ `id: id` → ComicDetails 没有 id 参数
- ❌ `author: author` → 作者应放在 tags 里
- ❌ `status: ...` → 没有 status 参数
- ❌ `isMultiEp: ...` → 没有此参数

---

## 阶段6：章节图片开发

**目标**：实现章节图片加载功能

### TDD 步骤1：分析章节页结构

1. 让用户提供一个具体的章节页URL
2. 分析图片加载方式：
   - 直接 img 标签
   - JS 动态加载
   - 加密/混淆的图片地址
   - 需要特殊请求头

### TDD 步骤2：编写测试验证

测试内容：
1. 能否提取所有图片URL
2. 图片URL是否完整可用
3. 图片数量是否合理
4. 是否过滤了非漫画图片（logo、广告等）

### TDD 步骤3：实现代码

```javascript
loadEp: async (comicId, epId) => {
    // 获取章节页面
    // 提取图片URL列表
    return { images: [...] }
}
```

---

## 阶段7：整合与最终验证

**目标**：确保完整的漫画源可以正常工作，并生成 index.json 条目

### 验证清单

使用 `scripts/validate_source.py` 自动检查：

```bash
python3 scripts/validate_source.py <源文件路径>
```

### 手动检查项

- [ ] 所有标题与 name 一致
- [ ] 所有 HtmlDocument 使用正确
- [ ] chapters 是 Map 格式
- [ ] tags 是对象格式
- [ ] ComicDetails 参数正确
- [ ] 状态码检查完整
- [ ] dispose() 调用正确
- [ ] 错误处理完善

### 输出最终文件

确认所有检查通过后，向用户交付最终的漫画源文件。

### 生成 index.json 条目

漫画源完成后，生成对应的 index.json 条目：

**JSON 格式**：
```json
{
    "name": "漫画源名称",
    "fileName": "文件名.js",
    "key": "source_key",
    "version": "1.0.0",
    "description": "可选描述"
}
```

**输出方式**：

1. **直接输出到对话框** - 默认方式，将JSON格式的条目直接展示给用户
2. **写入 index.json** - 如果工作目录根目录存在 `index.json` 且格式正确：
   - 先检查是否已存在相同 key 的条目
   - 如果存在，询问用户是否更新
   - 如果不存在，询问用户是否添加
   - 经用户同意后，将新条目追加到数组末尾
   - 保持 JSON 格式正确（缩进4空格）

使用 `scripts/manage_index.py` 辅助管理 index.json。

---

## 常见错误速查表

| 错误信息 | 原因 | 修复方法 |
|---------|------|---------|
| `ReferenceError: Document is not defined` | 使用了未定义的 Document | 改为 `new HtmlDocument(res.body)` |
| `type 'List<dynamic>' is not a subtype of type 'Map<dynamic, dynamic>'` | chapters 是数组不是Map | 改为 `new Map()` 用 `.set(id, title)` |
| `type '_Map<String, dynamic>' is not a subtype of type 'List<dynamic>'` | 探索页返回对象不是数组 | multiPartPage 返回 `[{title, comics}, ...]` |
| 标题不统一 | 探索页/分类页标题与name不同 | 全部改为与 name 一致 |
| 详情页加载失败 | ComicDetails参数错误 | 只传有效参数：title, cover, description, tags, chapters, updateTime |

---

## 辅助工具

### 脚本说明

| 脚本 | 用途 |
|------|------|
| `scripts/analyze_page.py` | 自动分析页面结构（列表/分类/详情） |
| `scripts/validate_source.py` | 自动检查源代码常见错误 |
| `scripts/manage_index.py` | 管理 index.json 索引文件 |
| `references/test_template.py` | 测试脚本模板 |

### manage_index.py 使用说明

```bash
# 检查 index.json 格式
python scripts/manage_index.py check <index.json路径>

# 生成单个条目JSON
python scripts/manage_index.py generate <name> <fileName> <key> <version> [description]

# 检查key是否存在
python scripts/manage_index.py exists <index.json路径> <key>

# 添加新条目
python scripts/manage_index.py add <index.json路径> <name> <fileName> <key> <version> [description]

# 更新条目
python scripts/manage_index.py update <index.json路径> <name> <fileName> <key> <version> [description]

# 列出所有条目
python scripts/manage_index.py list <index.json路径>
```

### 参考文件

| 文件 | 说明 |
|------|------|
| `references/source_template.js` | 标准漫画源模板 |
| `references/checklist.md` | 代码检查清单 |

---

## 工作原则

1. **TDD优先**：每一步先写测试验证，再实现代码
2. **分步进行**：一次只处理一个功能模块
3. **用户确认**：每个阶段完成后，向用户确认再进入下一步
4. **主动分析**：使用Python脚本辅助分析，减少猜测
5. **错误预防**：严格遵守格式规范，避免常见错误
