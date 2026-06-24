# Venera 漫画源构建器 - 快速开始

采用测试驱动开发（TDD）流程，分步引导你完成漫画源的创建，确保每一步都经过验证。

---

## 🚀 快速开始

### 第 1 步：准备工作

确保你的环境已安装：
- Python 3.8+
- 以下 Python 依赖：
  ```bash
  pip install requests beautifulsoup4
  ```

### 第 2 步：收集基本信息

在开始之前，准备好以下信息：

| 信息 | 示例 | 说明 |
|------|------|------|
| 漫画源名称 | 漫画屋 | 用户看到的显示名称 |
| 唯一标识符 (key) | manhua5 | 英文小写，无空格 |
| 版本号 | 1.0.0 | 语义化版本号 |
| 网站首页 URL | https://www.mhua5.com/ | 漫画网站首页地址 |

### 第 3 步：按照 7 个阶段逐步开发

按顺序完成以下阶段，每个阶段先测试再写代码：

```
阶段1: 收集信息 → 阶段2: 探索页 → 阶段3: 分类页 → 阶段4: 搜索页
→ 阶段5: 详情页 → 阶段6: 章节页 → 阶段7: 整合验证
```

---

## 📁 目录结构

```
venera-comic-source-builder/
├── SKILL.md              # 完整技能文档（详细开发指南）
├── README.md             # 本文件：快速开始指南
├── references/           # 参考资料
│   ├── checklist.md      # 代码检查清单
│   ├── source_template.js # 漫画源模板
│   └── test_template.py  # 测试脚本模板
└── scripts/              # 辅助工具脚本
    ├── analyze_page.py   # 自动分析页面结构
    ├── validate_source.py # 自动检查源文件错误
    └── manage_index.py   # 管理 index.json 索引
```

---

## 🛠️ 核心工具使用

### 1. 分析页面结构

快速了解网站的 HTML 结构，辅助选择器定位：

```bash
# 分析列表页（首页/分类页/搜索结果页）
python3 scripts/analyze_page.py list <网站URL>

# 分析分类导航
python3 scripts/analyze_page.py category <网站URL>

# 分析漫画详情页
python3 scripts/analyze_page.py detail <详情页URL>

# 全部分析
python3 scripts/analyze_page.py all <URL>
```

### 2. 检查源代码

开发完成后，自动检查常见错误：

```bash
python3 scripts/validate_source.py <你的漫画源文件.js>
```

会检查以下内容：
- ✅ `HtmlDocument` 使用是否正确
- ✅ 探索页/分类页标题是否与 `name` 一致
- ✅ `chapters` 是否为 `Map` 格式
- ✅ `tags` 是否为对象格式
- ✅ 章节图片是否有空数组检查
- ✅ 状态码检查、`dispose()` 调用等

### 3. 管理索引文件

完成漫画源后，管理 `index.json` 索引：

```bash
# 检查 index.json 格式
python3 scripts/manage_index.py check index.json

# 生成单个条目（输出到控制台）
python3 scripts/manage_index.py generate "漫画屋" manhua5.js manhua5 1.0.0

# 添加新条目到 index.json
python3 scripts/manage_index.py add index.json "漫画屋" manhua5.js manhua5 1.0.0

# 列出所有条目
python3 scripts/manage_index.py list index.json

# 检查 key 是否存在
python3 scripts/manage_index.py exists index.json manhua5
```

---

## ⚠️ 常见坑点速查

| 问题 | 原因 | 解决方法 |
|------|------|---------|
| `Document is not defined` | 用了 `new Document()` | 改为 `new HtmlDocument(res.body)` |
| chapters 类型错误 | 用了数组 `[]` | 用 `new Map()` + `.set(id, title)` |
| 标签提取到"作者："文字 | 选择器用错了 | 遍历父容器，根据文本前缀区分 |
| 章节只有 24 章 | 页面初始只渲染部分 | 通过 POST API 获取完整列表 |
| 图片加载报错 clamp | `loadEp` 返回空数组 | 检查图片提取逻辑，加空数组检查 |
| 图片 403 错误 | 防盗链，缺 Referer | 设置 `onImageLoad` 返回 headers |
| 探索页返回格式错 | 返回了对象 | `multiPartPage` 要返回数组 `[{title, comics}, ...]` |

---

## 📖 详细文档

完整的开发流程和技术细节请查看 [SKILL.md](./SKILL.md)，包含：
- 每个阶段的 TDD 详细步骤
- 代码模板和最佳实践
- 三级降级提取策略
- 常见错误完整速查表
