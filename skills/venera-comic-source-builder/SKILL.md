---
name: venera-comic-source-builder
description: "快速生成Venera漫画阅读器的漫画源配置文件，支持自动分析网站结构、分步测试验证、自动生成完整源文件，全自动化流程，失败自动重试"
author: "Venera Comic Source Builder Team"
version: "1.0.0"
tags: ["漫画", "Venera", "源生成器", "自动化"]
---

# Venera 漫画源生成器

自动分析漫画网站结构，生成完整的 Venera 漫画源配置文件。

## 功能特性

| 特性 | 描述 |
|------|------|
| ✅ **自动分析** | 智能分析网站 HTML 结构，自动提取漫画列表、章节、图片等信息 |
| ✅ **分步测试** | 依次测试发现页、搜索页、分类页、漫画详情、图片获取，每个步骤独立验证 |
| ✅ **失败重试** | 测试失败时自动重试（最多3次），指数退避延迟 |
| ✅ **反爬应对** | 随机 User-Agent、请求延迟、会话保持 |
| ✅ **备用域名** | 支持配置多个备用域名，主域名失败时自动切换 |
| ✅ **依赖检查** | 自动检测 Python 依赖，缺失时给出明确提示 |
| ✅ **纯 Python** | 无需 Node.js，只需 Python 3.8+ |

## 快速开始

### 安装依赖

```bash
pip install requests beautifulsoup4 fake-useragent
```

### 基本用法

```bash
# 最简单的用法 - 只需要提供漫画网站URL
python3 main.py --url https://example.com/comic

# 指定网站名称和源Key
python3 main.py --url https://example.com/comic --name "我的漫画" --key "my_comic"

# 完整参数示例
python3 main.py \
  --url https://example.com/comic \
  --name "我的漫画" \
  --key "my_comic" \
  --version "1.0.0" \
  --need-login \
  --backup-domains "backup1.example.com,backup2.example.com"
```

## 命令行参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| --url | string | **是** | - | 漫画网站主页URL |
| --name | string | 否 | 从URL提取 | 源显示名称 |
| --key | string | 否 | 小写网站名 | 源唯一标识（用于文件名） |
| --version | string | 否 | 1.0.0 | 源版本号 |
| --need-login | flag | 否 | false | 是否需要登录才能访问 |
| --backup-domains | string | 否 | - | 备用域名列表，逗号分隔 |
| --help | flag | 否 | - | 显示帮助信息 |

## 工作流程

```
┌─────────────────────────────────────────────────────────────┐
│                    Venera 漫画源生成器                       │
├─────────────────────────────────────────────────────────────┤
│  Step 1: 依赖检查                                           │
│     └─→ 检测 requests, beautifulsoup4, fake-useragent       │
│           缺失则提示安装命令并退出                           │
├─────────────────────────────────────────────────────────────┤
│  Step 2: 分步测试（每项失败自动重试3次）                      │
│     ├─→ 发现页测试（提取漫画列表结构）                        │
│     ├─→ 搜索页测试（检测搜索功能）                           │
│     ├─→ 分类页测试（提取分类列表）                           │
│     ├─→ 漫画详情测试（提取标题、封面、章节）                   │
│     └─→ 图片获取测试（提取章节图片）                         │
├─────────────────────────────────────────────────────────────┤
│  Step 3: 生成源文件                                         │
│     └─→ 根据测试结果填充模板，生成 <key>.js 文件              │
├─────────────────────────────────────────────────────────────┤
│  Step 4: 显示报告                                           │
│     └─→ 展示各步骤状态、生成文件路径                         │
└─────────────────────────────────────────────────────────────┘
```

## 使用示例

### 示例1：创建基本漫画源

```bash
python3 main.py --url https://manhua.example.com
```

**输出：**
```
============================================================
          漫画源生成报告
============================================================
  ℹ️ 检查Python依赖...
  ✅ Python依赖检查通过

  ℹ️ 
开始运行测试...
  ℹ️ 开始测试发现页...
  ✅ 发现页测试通过，解析到 15 个漫画
  ℹ️ 开始测试搜索功能...
  ✅ 搜索测试通过，找到 10 个结果
  ℹ️ 开始测试分类功能...
  ⚠️ 未找到分类结构
  ℹ️ 开始测试漫画详情...
  ✅ 漫画详情测试通过，标题: 海贼王，章节数: 1000
  ℹ️ 开始测试漫画图片...
  ✅ 漫画图片测试通过，找到 20 张图片

  ℹ️ 
开始生成漫画源文件...
  ✅ 漫画源文件已生成: /path/to/manhua_example.js
============================================================

生成的源文件: /path/to/manhua_example.js
```

### 示例2：带备用域名的源

```bash
python3 main.py \
  --url https://main.example.com \
  --name "备用域名测试" \
  --key "backup_test" \
  --backup-domains "cdn1.example.com,cdn2.example.com"
```

### 示例3：需要登录的源

```bash
python3 main.py \
  --url https://vip.example.com \
  --name "VIP漫画" \
  --key "vip_comic" \
  --need-login
```

## 生成的源文件结构

生成的 `.js` 文件包含以下部分：

```javascript
class MyComic extends ComicSource {
    name = "我的漫画"
    key = "my_comic"
    version = "1.0.0"
    minAppVersion = "1.6.0"
    url = "https://example.com"

    // 发现页配置
    explore = [...]
    
    // 搜索配置（如支持）
    search = {...}
    
    // 分类配置（如支持）
    category = {...}
    
    // 漫画详情与章节配置
    comic = {
        loadInfo: async (id) => {...},
        loadEp: async (comicId, epId) => {...}
    }
}
```

## 故障排除

### 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| `缺少依赖包: requests` | 未安装必要的Python包 | 运行 `pip install requests beautifulsoup4 fake-useragent` |
| `测试失败，请求失败` | 网站无法访问或被反爬拦截 | 检查网络连接，尝试添加 `--backup-domains` |
| `未找到漫画列表结构` | 网站结构与预期不符 | 检查网站HTML结构，可能需要手动调整选择器 |
| `解析测试结果失败` | Python脚本输出异常 | 检查Python版本，确保使用Python 3.8+ |
| `请求被限制` | 触发网站反爬机制 | 增加请求延迟（脚本自动处理），考虑添加备用域名 |

### 调试模式

如需查看详细的调试信息，可以在测试脚本中添加日志：

```python
# 在 comic_source_tester.py 中需要的位置添加
self.log('DEBUG', f'HTML内容片段: {response.text[:500]}')
```

## 高级配置

### 自定义模板

您可以修改 `references/template.js` 来自定义生成的源文件结构：

```javascript
/** @type {import('./_venera_.js')} */

class {{NAME}} extends ComicSource {
    name = "{{NAME}}"
    key = "{{KEY}}"
    version = "{{VERSION}}"
    minAppVersion = "1.6.0"
    url = "{{URL}}"
    enabled = true
    // 添加自定义属性...

    {{EXPLORE_SECTION}}
    {{SEARCH_SECTION}}
    {{CATEGORY_SECTION}}
    {{COMIC_SECTION}}
}
```

### 扩展测试功能

如果需要支持更多网站特性，可以修改 `scripts/comic_source_tester.py` 中的选择器列表：

```python
comic_selectors = [
    'div.comic-item', 'div.manga-item', 'div.book-item',
    'article.comic', 'li.comic-item', 'div.item',
    '.comic-list > div', '.manga-list > div', '.list-item',
    'div.card', 'div.box'  # 添加自定义选择器
]
```

## 与 Venera 阅读器集成

### 导入源文件

1. 将生成的 `.js` 文件复制到 Venera 阅读器的源目录
2. 在应用中刷新源列表
3. 选择新添加的源开始阅读

### 源目录位置

| 平台 | 路径 |
|------|------|
| Android | `/sdcard/Android/data/com.example.venera/files/sources/` |
| iOS | `Files App > Venera > sources/` |
| Windows | `%APPDATA%\Venera\sources\` |

## 文件结构

```
venera-comic-source-builder/
├── SKILL.md                    # 技能描述文档（本文件）
├── main.py                     # 命令行入口，参数解析
├── builder.py                  # 构建器核心逻辑
├── retry.py                    # 异步重试机制
├── scripts/                    # 测试脚本目录
│   ├── comic_source_tester.py  # 漫画源测试脚本（HTML解析）
│   └── dependency_checker.py   # 依赖检查脚本
└── references/                 # 参考模板目录
    └── template.js             # 漫画源模板文件
```

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0.0 | 2026-06-23 | 初始版本，纯Python实现 |

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

---

*本技能由 Venera Comic Source Builder Team 维护*
