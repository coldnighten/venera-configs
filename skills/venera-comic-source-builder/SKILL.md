---
name: venera-comic-source-builder
description: "快速生成Venera漫画阅读器的漫画源配置文件，支持自动分析网站结构、分步测试验证、自动生成完整源文件，全自动化流程，失败自动重试"
---

# Venera 漫画源生成器

自动分析漫画网站结构，生成完整的 Venera 漫画源配置文件。

## 功能特性

- ✅ 自动分析网站 HTML 结构
- ✅ 分步测试验证（发现页、搜索页、分类页、漫画详情、图片获取）
- ✅ 支持备用域名切换
- ✅ 基础反爬应对（随机 User-Agent、请求延迟）
- ✅ 自动生成完整源文件
- ✅ **全自动化流程** - 通过命令行参数驱动，无需人工干预
- ✅ **失败自动重试** - 每个步骤最多重试3次，无需手动重启
- ✅ **依赖检查** - 自动检测并提示安装必要的Python依赖
- ✅ **纯 Python 实现** - 无需 Node.js 环境

## 使用方法

```bash
# 基本用法
python3 main.py --url https://example.com/comic

# 完整参数
python3 main.py \
  --url https://example.com/comic \
  --name "漫画网站" \
  --key "my_comic" \
  --version "1.0.0" \
  --need-login \
  --backup-domains "backup1.com,backup2.com"
```

## 命令行参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| --url | string | 是 | - | 漫画网站URL |
| --name | string | 否 | 从URL提取 | 网站名称 |
| --key | string | 否 | 小写网站名 | 源Key |
| --version | string | 否 | 1.0.0 | 版本号 |
| --need-login | flag | 否 | false | 是否需要登录 |
| --backup-domains | string | 否 | - | 备用域名，逗号分隔 |

## 工作流程

1. **依赖检查** → 自动检测Python依赖是否安装
2. **分步测试** → 自动测试发现页、搜索页、分类页、漫画详情、图片获取（失败自动重试）
3. **生成源文件** → 根据测试结果自动生成 `.js` 源文件
4. **显示报告** → 展示测试结果和生成的文件路径

## 依赖要求

- Python 3.8+
- 安装 Python 依赖：
  ```bash
  pip install requests beautifulsoup4 fake-useragent
  ```

## 输出

- 生成的漫画源文件（`.js`）
- 详细测试报告

## 文件结构

```
venera-comic-source-builder/
├── SKILL.md                    # 技能描述文档
├── main.py                     # 主入口（命令行参数处理）
├── builder.py                  # 构建器核心逻辑
├── retry.py                    # 重试机制模块
├── scripts/                    # Python脚本目录
│   ├── comic_source_tester.py  # 漫画源测试脚本
│   └── dependency_checker.py   # 依赖检查脚本
└── references/                 # 模板目录
    └── template.js             # 漫画源模板
```