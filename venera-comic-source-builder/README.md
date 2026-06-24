# Venera 漫画源构建器

用于创建、调试 Venera 阅读器的漫画源规则。

## 特点

- TDD 驱动：测试 → 实现 → 验证
- 自动分析页面结构
- 支持 AES 加密图片解密

## 使用前提

- Python 3.x
- 依赖：requests、BeautifulSoup4、pycryptodome

## 快速开始

发给你的 agent：

```
使用 venera-comic-source-builder 创建漫画源 https://xxx.com
```

## 流程说明

创建漫画源分 7 个阶段：探索页 → 分类页 → 搜索页 → 详情页 → 章节页 → 整合验证

每一步都会先测试验证，测试通过后才会继续。
