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
