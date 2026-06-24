#!/usr/bin/env python3
"""
漫画源代码自动检查工具
检查常见错误和格式问题
"""

import re
import sys

def check_source_file(filepath):
    """检查漫画源文件"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    issues = []
    warnings = []
    info = []
    
    # 1. 检查 Document 误用
    doc_matches = re.findall(r'new Document\(', content)
    if doc_matches:
        issues.append(f"❌ 使用了 new Document()，应改为 new HtmlDocument()，共 {len(doc_matches)} 处")
    
    # 2. 检查 HtmlDocument 使用
    htmldoc_matches = re.findall(r'new HtmlDocument\(', content)
    if htmldoc_matches:
        info.append(f"✅ 使用 HtmlDocument()，共 {len(htmldoc_matches)} 处")
    
    # 3. 检查 textContent 误用
    textcontent_matches = re.findall(r'\.textContent', content)
    if textcontent_matches:
        issues.append(f"❌ 使用了 .textContent，应改为 .text，共 {len(textcontent_matches)} 处")
    
    # 4. 检查 getAttribute 误用
    getattribute_matches = re.findall(r'\.getAttribute\(', content)
    if getattribute_matches:
        issues.append(f"❌ 使用了 .getAttribute()，应改为 .attributes['xxx']，共 {len(getattribute_matches)} 处")
    
    # 5. 提取 name
    name_match = re.search(r'name\s*=\s*["\'](.+?)["\']', content)
    source_name = name_match.group(1) if name_match else None
    if source_name:
        info.append(f"📛 漫画源名称: {source_name}")
    
    # 6. 检查探索页标题一致性
    explore_title_match = re.search(r'explore\s*=\s*\[.*?title\s*:\s*["\'](.+?)["\']', content, re.DOTALL)
    if explore_title_match and source_name:
        explore_title = explore_title_match.group(1)
        if explore_title == source_name:
            info.append(f"✅ 探索页标题与 name 一致: {explore_title}")
        else:
            issues.append(f"❌ 探索页标题 '{explore_title}' 与 name '{source_name}' 不一致")
    
    # 7. 检查分类页标题一致性
    category_title_match = re.search(r'category\s*=\s*\{.*?title\s*:\s*["\'](.+?)["\']', content, re.DOTALL)
    if category_title_match and source_name:
        category_title = category_title_match.group(1)
        if category_title == source_name:
            info.append(f"✅ 分类页标题与 name 一致: {category_title}")
        else:
            issues.append(f"❌ 分类页标题 '{category_title}' 与 name '{source_name}' 不一致")
    
    # 8. 检查 chapters 是否为 Map
    # 查找 loadInfo 函数中的 chapters
    loadinfo_match = re.search(r'loadInfo.*?return new ComicDetails\(\{(.*?)\}\)', content, re.DOTALL)
    if loadinfo_match:
        comic_details_content = loadinfo_match.group(1)
        
        # 检查 chapters 是否在 ComicDetails 中
        if 'chapters' in comic_details_content:
            info.append("✅ ComicDetails 包含 chapters")
        else:
            warnings.append("⚠️ ComicDetails 未包含 chapters")
        
        # 检查是否有错误的参数
        bad_params = [' id:', ' author:', ' status:', ' isMultiEp:']
        for param in bad_params:
            if param in comic_details_content:
                issues.append(f"❌ ComicDetails 包含错误参数{param.strip()}")
    
    # 9. 检查 tags 格式
    if loadinfo_match:
        comic_details_content = loadinfo_match.group(1)
        # 检查 tags 是否是对象格式
        tags_match = re.search(r'tags\s*:\s*\{', comic_details_content)
        if tags_match:
            info.append("✅ tags 为对象格式")
        else:
            tags_array_match = re.search(r'tags\s*:\s*\[', comic_details_content)
            if tags_array_match:
                issues.append("❌ tags 为数组格式，应改为对象格式 {作者: [...], 标签: [...]}")
    
    # 10. 检查是否有 dispose 调用
    dispose_matches = re.findall(r'\.dispose\(\)', content)
    if dispose_matches:
        info.append(f"✅ 调用了 dispose()，共 {len(dispose_matches)} 处")
    else:
        warnings.append("⚠️ 未调用 document.dispose()")
    
    # 11. 检查状态码检查
    status_checks = re.findall(r'status\s*!==\s*200', content)
    if status_checks:
        info.append(f"✅ 状态码检查，共 {len(status_checks)} 处")
    else:
        warnings.append("⚠️ 缺少状态码检查")
    
    # 12. 检查 loadEp 函数
    loadep_match = re.search(r'loadEp\s*:\s*async.*?return\s*\{.*?images.*?\}', content, re.DOTALL)
    if loadep_match:
        info.append("✅ 存在 loadEp 函数")
        
        # 检查是否有空数组检查
        if 'images.length === 0' in content or 'if (!images.length)' in content or 'if (images.length == 0)' in content:
            info.append("✅ loadEp 有空数组检查")
        else:
            warnings.append("⚠️ loadEp 缺少空数组检查（可能导致 clamp 报错）")
        
        # 检查是否提取了JS变量（高级）
        if 'var' in content and ('num' in content or 'pasd' in content or 'path' in content):
            if re.search(r'html\.match.*?var.*?(num|pasd|path)', content, re.DOTALL):
                info.append("✅ loadEp 使用了 JS 变量提取方式")
        
        # 检查是否有广告过滤
        if 'ad' in content.lower() or 'ads' in content.lower():
            if re.search(r'(cdnweb\.win|ads\.|advertisement)', content):
                info.append("✅ loadEp 有广告域名过滤")
    else:
        warnings.append("⚠️ 未找到 loadEp 函数")
    
    # 13. 检查 onImageLoad（防盗链）
    if 'onImageLoad' in content:
        info.append("✅ 设置了 onImageLoad（处理防盗链）")
    else:
        warnings.append("⚠️ 未设置 onImageLoad（图片可能需要 Referer）")
    
    # 14. 检查章节API获取（高级特性）
    if re.search(r'Network\.post.*chapter|fetchChapters', content, re.DOTALL):
        info.append("✅ 使用了 POST API 获取章节")
    else:
        if re.search(r'chapters\.size|chapters\.length', content):
            warnings.append("⚠️ 未发现章节API获取（可能只获取到部分章节）")
    
    # 15. 检查章节反转（高级特性）
    if 'reverse()' in content or 'i--' in content:
        info.append("✅ 章节列表已反转（确保正序）")
    
    # 16. 检查标签提取方式
    if re.search(r'\.startsWith\(["\']作者|startsWith\("作者', content):
        info.append("✅ 使用了文本前缀区分方式提取标签")
    else:
        warnings.append("⚠️ 未使用文本前缀区分（可能提取到标签名而非值）")
    
    # 17. 检查 viewMore 格式
    if 'explore' in content:
        # 先检查是否有 viewMore 关键字
        if 'viewMore' in content:
            # 查找静态定义的 viewMore 对象（viewMore: { ... }）
            viewmore_obj_matches = re.findall(r'viewMore\s*:\s*(\{[^}]+(?:\{[^}]*\}[^}]*)*\})', content, re.DOTALL)
            
            if viewmore_obj_matches:
                info.append(f"✅ 发现 {len(viewmore_obj_matches)} 个静态 viewMore 配置")
                
                # 检查每个 viewMore 的格式
                valid_count = 0
                for i, vm in enumerate(viewmore_obj_matches):
                    # 跳过 viewMore: null 的情况
                    if vm.strip() == 'null' or vm.strip() == 'undefined':
                        continue
                    
                    # 检查是否有 page 字段
                    page_match = re.search(r'page\s*:\s*["\'](category|search)["\']', vm)
                    if not page_match:
                        # 也可能是用变量或其他方式，宽松处理
                        page_any = re.search(r'page\s*:', vm)
                        if not page_any:
                            issues.append(f"❌ viewMore[{i}] 缺少 page 字段")
                            continue
                    
                    page_value = page_match.group(1) if page_match else None
                    
                    # 检查是否有 attributes
                    attrs_match = re.search(r'attributes\s*:\s*\{', vm)
                    if not attrs_match:
                        issues.append(f"❌ viewMore[{i}] 缺少 attributes 字段")
                        continue
                    
                    # 根据 page 类型检查 attributes 内容
                    if page_value == 'category':
                        # 检查是否有 category 和 param（或 search 等其他字段，宽松处理）
                        if 'category' not in vm[attrs_match.end():]:
                            warnings.append(f"⚠️ viewMore[{i}] 跳转到分类页但 attributes 中可能缺少 category 字段")
                        
                    elif page_value == 'search':
                        if 'keyword' not in vm[attrs_match.end():]:
                            warnings.append(f"⚠️ viewMore[{i}] 跳转到搜索页但 attributes 中可能缺少 keyword 字段")
                    
                    valid_count += 1
                
                if valid_count > 0:
                    info.append(f"✅ {valid_count} 个静态 viewMore 格式正确")
            else:
                # 有 viewMore 关键字但没有静态对象，说明是动态生成的
                info.append("✅ 发现 viewMore 配置（动态生成）")
        else:
            # 有 explore 但没有 viewMore，给出警告（因为可能有"更多"按钮但忘了加）
            warnings.append("⚠️ 未发现 viewMore 配置，请确认首页是否有'更多'按钮需要配置")
    
    # 18. 检查正则表达式中是否包含中文（FlutterQjs 限制）
    regex_patterns = re.findall(r'(/[^/\n]+/[gimsu]*)\s*', content)
    chinese_in_regex = []
    for regex in regex_patterns:
        # 提取正则主体（去掉开头的 / 和结尾的 flags）
        regex_body = regex[1:]
        if '/' in regex_body:
            regex_body = regex_body[:regex_body.rfind('/')]
        
        # 检查是否包含中文
        has_chinese = any('\u4e00' <= c <= '\u9fff' for c in regex_body)
        if has_chinese:
            chinese_in_regex.append(regex)
    
    if chinese_in_regex:
        issues.append(f"❌ 正则表达式中包含中文，FlutterQjs 不支持。请改用字符串方法。发现 {len(chinese_in_regex)} 处")
        for regex in chinese_in_regex[:3]:
            issues.append(f"   - {regex}")
    else:
        info.append("✅ 正则表达式中未包含中文")
    
    # 输出结果
    print("=" * 60)
    print(f"漫画源检查报告: {filepath}")
    print("=" * 60)
    
    if info:
        print("\n📋 基本信息:")
        for item in info:
            print(f"  {item}")
    
    if warnings:
        print("\n⚠️ 警告:")
        for item in warnings:
            print(f"  {item}")
    
    if issues:
        print("\n❌ 错误:")
        for item in issues:
            print(f"  {item}")
    else:
        print("\n🎉 未发现错误！")
    
    print("\n" + "=" * 60)
    print(f"总计: {len(issues)} 个错误, {len(warnings)} 个警告, {len(info)} 项信息")
    
    return len(issues) == 0

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("用法: python validate_source.py <漫画源文件路径>")
        sys.exit(1)
    
    filepath = sys.argv[1]
    success = check_source_file(filepath)
    sys.exit(0 if success else 1)
