#!/usr/bin/env python3
"""
Venera漫画源页面分析测试脚本模板
用于快速验证页面结构和数据提取逻辑
"""

import requests
from bs4 import BeautifulSoup
import re

def fetch_page(url, headers=None):
    """抓取页面内容"""
    default_headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    if headers:
        default_headers.update(headers)
    
    response = requests.get(url, headers=default_headers)
    print(f"状态码: {response.status_code}")
    print(f"URL: {url}")
    print(f"内容长度: {len(response.text)} 字符")
    return response.text

def test_selector(html, selector, description=""):
    """测试CSS选择器"""
    soup = BeautifulSoup(html, 'html.parser')
    elements = soup.select(selector)
    print(f"\n[{description}]")
    print(f"选择器: {selector}")
    print(f"找到元素数量: {len(elements)}")
    
    for i, elem in enumerate(elements[:5]):  # 只显示前5个
        text = elem.get_text(strip=True)[:100]
        print(f"  [{i}] 文本: {text}")
        # 打印主要属性
        for attr in ['href', 'src', 'data-src', 'data-original', 'class', 'id']:
            if elem.get(attr):
                print(f"      {attr}: {elem.get(attr)[:80]}")
    
    return elements

def test_regex(text, pattern, description=""):
    """测试正则表达式"""
    matches = re.findall(pattern, text)
    print(f"\n[{description}]")
    print(f"正则: {pattern}")
    print(f"匹配数量: {len(matches)}")
    for i, m in enumerate(matches[:5]):
        print(f"  [{i}] {str(m)[:100]}")
    return matches

def extract_comic_info(html, item_selector, title_selector, cover_selector, link_selector):
    """提取漫画信息（通用模板）"""
    soup = BeautifulSoup(html, 'html.parser')
    items = soup.select(item_selector)
    
    print(f"\n[提取漫画信息]")
    print(f"漫画项数量: {len(items)}")
    
    results = []
    for i, item in enumerate(items[:5]):
        title_elem = item.select_one(title_selector)
        cover_elem = item.select_one(cover_selector)
        link_elem = item.select_one(link_selector)
        
        title = title_elem.get_text(strip=True) if title_elem else "N/A"
        cover = ""
        if cover_elem:
            cover = cover_elem.get('src') or cover_elem.get('data-src') or cover_elem.get('data-original') or "N/A"
        link = link_elem.get('href') if link_elem else "N/A"
        
        # 从链接提取ID
        comic_id = "N/A"
        if link and '/comic/' in link:
            parts = link.rstrip('/').split('/comic/')
            if len(parts) > 1:
                comic_id = parts[-1]
        
        print(f"\n  [{i}] 标题: {title}")
        print(f"      封面: {cover}")
        print(f"      链接: {link}")
        print(f"      ID: {comic_id}")
        
        results.append({
            'id': comic_id,
            'title': title,
            'cover': cover,
            'link': link
        })
    
    return results

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("用法: python test_template.py <URL>")
        sys.exit(1)
    
    url = sys.argv[1]
    html = fetch_page(url)
    
    # 保存HTML到文件以便调试
    with open('page_debug.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("\nHTML已保存到 page_debug.html")
