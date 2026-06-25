# Venera 漫画源构建器

用于创建、调试 Venera 阅读器的漫画源规则。

## 特点

- TDD 驱动：测试 → 实现 → 验证
- 自动分析页面结构
- 支持 AES 加密图片解密
- 支持登录、注册、收藏功能
- 支持图片防盗链处理

## 使用前提

- Python 3.x
- 依赖：requests、BeautifulSoup4、pycryptodome

## 快速开始

发给你的 agent：

```
使用 venera-comic-source-builder 创建漫画源 https://xxx.com
```

## 流程说明

创建漫画源分 8 个阶段：
1. 探索页
2. 分类页
3. 搜索页
4. 详情页
5. 章节页
6. 登录/收藏功能（可选）
7. 整合验证

每一步都会先测试验证，测试通过后才会继续。

## 进阶功能

### 登录和收藏功能

如果目标网站有用户系统，可以添加登录、注册、收藏功能：

```
使用 venera-comic-source-builder 为 xxx.js 添加登录和收藏功能
```

### 防盗链处理

如果图片加载失败（403/空白图），需要设置 Referer 头。详细说明见：
- `references/auth_and_favorites.md`
