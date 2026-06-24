# 常见错误速查表

## 错误信息与修复

| 错误信息 | 原因 | 修复方法 |
|---------|------|---------|
| `ReferenceError: Document is not defined` | 使用了未定义的 Document | 改为 `new HtmlDocument(res.body)` |
| `type 'List<dynamic>' is not a subtype of type 'Map<dynamic, dynamic>'` | chapters 是数组不是Map | 改为 `new Map()` 用 `.set(id, title)` |
| `type '_Map<String, dynamic>' is not a subtype of type 'List<dynamic>'` | 探索页返回对象不是数组 | multiPartPage 返回 `[{title, comics}, ...]` |
| 标题不统一 | 探索页/分类页标题与name不同 | 全部改为与 name 一致 |
| 详情页加载失败 | ComicDetails参数错误 | 只传有效参数：title, cover, description, tags, chapters, updateTime |
| `Invalid argument(s): 1` at `int.clamp` | **loadEp 返回空数组** | 检查图片提取逻辑；确认是否为JS动态生成；过滤广告导致列表为空；添加空数组检查 |
| 图片加载403 | 防盗链，缺少 Referer | 设置 `onImageLoad` 返回 headers |
| 图片数量异常（只有1-2张） | 提取到广告图而非漫画图 | 检查域名过滤；使用JS变量提取方式 |
| 章节只有24章 | 页面初始只渲染部分章节 | 通过 POST API 获取完整列表 |
| 章节倒序显示 | API 返回的章节是倒序排列 | 反转数组后存入 Map |
| 标签提取到"作者/标签/更新" | 用错选择器，提取到了标签名而非值 | 遍历父容器，根据文本前缀区分类型 |

## 常见错误原因

### loadEp 返回空数组

**表现**：`Invalid argument(s): 1` at `int.clamp`

**排查步骤**：
1. 检查页面源码中是否有 JS 变量（`var num`、`var pasd` 等）
2. 检查 DOM 中的图片元素是否被懒加载（`data-src`、`data-original`）
3. 检查是否过滤掉了广告图导致列表为空
4. 确认正则匹配是否正确

### 图片加载 403

**原因**：防盗链，需要设置 Referer 头

**解决方法**：
```javascript
onImageLoad: (url, comicId, epId) => {
    return {
        headers: {
            "Referer": this.url,
        }
    }
}
```
