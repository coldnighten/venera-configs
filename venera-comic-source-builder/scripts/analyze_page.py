#!/usr/bin/env python3
"""
漫画网站页面分析工具
自动分析页面结构，识别漫画列表、分类、章节等元素
"""

import requests
from bs4 import BeautifulSoup
import sys
import json

def fetch_page(url):
    """抓取页面"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    response = requests.get(url, headers=headers)
    print(f"URL: {url}")
    print(f"状态码: {response.status_code}")
    return response.text

def analyze_comic_list(html):
    """分析漫画列表结构"""
    soup = BeautifulSoup(html, 'html.parser')
    
    print("\n" + "="*60)
    print("【漫画列表结构分析】")
    print("="*60)
    
    # 寻找可能的漫画列表容器
    list_selectors = [
        '.comic-list', '.comics-list', '.list-comic', '.comic-grid',
        '.comic-items', '.items', '.list', '.grid', '.book-list',
        '.manga-list', '.manga-grid', '.chapter-list'
    ]
    
    found_containers = []
    for selector in list_selectors:
        elements = soup.select(selector)
        if elements:
            for elem in elements:
                items = elem.find_all(['li', 'div'], class_=lambda x: x and ('item' in x.lower() or 'comic' in x.lower() or 'book' in x.lower() or 'card' in x.lower()))
                if len(items) >= 3:
                    found_containers.append({
                        'selector': selector,
                        'item_count': len(items),
                        'class': elem.get('class', [])
                    })
    
    if found_containers:
        print(f"\n找到 {len(found_containers)} 个可能的漫画列表容器:")
        for i, container in enumerate(found_containers):
            print(f"\n  [{i}] 选择器: {container['selector']}")
            print(f"      class: {container['class']}")
            print(f"      子项数量: {container['item_count']}")
    else:
        print("\n未找到明显的漫画列表容器，尝试通用方法...")
        
        # 找所有包含图片和链接的区块
        all_divs = soup.find_all('div')
        comic_like = []
        for div in all_divs:
            imgs = div.find_all('img')
            links = div.find_all('a')
            if len(imgs) >= 3 and len(links) >= 3:
                comic_like.append(div)
        
        if comic_like:
            print(f"找到 {len(comic_like)} 个可能的列表容器")
    
    # 寻找漫画卡片特征
    print("\n" + "-"*60)
    print("【漫画卡片特征分析】")
    print("-"*60)
    
    # 找所有有图片和标题的元素
    comic_cards = []
    for img in soup.find_all('img'):
        parent = img.parent
        # 向上找3层
        for _ in range(3):
            if parent is None:
                break
            title_elem = parent.find(['a', 'h3', 'h4', 'p', 'span'], string=lambda x: x and len(x.strip()) > 1)
            if title_elem and title_elem.find('a'):
                link = title_elem.find('a')
            elif title_elem and title_elem.name == 'a':
                link = title_elem
            else:
                link = parent.find('a')
            
            if link and link.get('href'):
                comic_cards.append({
                    'img_src': img.get('src') or img.get('data-src') or '',
                    'title': link.get_text(strip=True)[:50],
                    'link': link.get('href'),
                    'parent_class': parent.get('class', [])
                })
                break
            parent = parent.parent
    
    if comic_cards:
        print(f"\n找到 {len(comic_cards)} 个可能的漫画卡片:")
        for i, card in enumerate(comic_cards[:5]):
            print(f"\n  [{i}] 标题: {card['title']}")
            print(f"      链接: {card['link'][:80]}")
            print(f"      图片: {card['img_src'][:80]}")
            print(f"      父级class: {card['parent_class']}")

def analyze_categories(html):
    """分析分类标签"""
    soup = BeautifulSoup(html, 'html.parser')
    
    print("\n" + "="*60)
    print("【分类标签分析】")
    print("="*60)
    
    # 寻找分类导航
    category_selectors = [
        '.category', '.categories', '.tags', '.tag-list',
        '.nav', '.menu', '.filter', '.sort', '.type'
    ]
    
    found_categories = []
    for selector in category_selectors:
        elements = soup.select(selector)
        for elem in elements:
            links = elem.find_all('a')
            if len(links) >= 3:
                found_categories.append({
                    'selector': selector,
                    'tag_count': len(links),
                    'tags': [a.get_text(strip=True) for a in links[:10]],
                    'class': elem.get('class', [])
                })
    
    if found_categories:
        print(f"\n找到 {len(found_categories)} 个可能的分类区域:")
        for i, cat in enumerate(found_categories):
            print(f"\n  [{i}] 选择器: {cat['selector']}")
            print(f"      class: {cat['class']}")
            print(f"      标签数量: {cat['tag_count']}")
            print(f"      前10个标签: {cat['tags']}")

def analyze_detail_page(html):
    """分析详情页结构"""
    soup = BeautifulSoup(html, 'html.parser')
    
    print("\n" + "="*60)
    print("【详情页结构分析】")
    print("="*60)
    
    # 找标题
    title_selectors = ['h1', '.title', '.comic-title', '.book-title', '.manga-title']
    for selector in title_selectors:
        elem = soup.select_one(selector)
        if elem:
            print(f"\n标题 (选择器: {selector}): {elem.get_text(strip=True)[:50]}")
            break
    
    # 找封面
    cover_selectors = ['.cover img', '.cover-image img', '.comic-cover img', '.book-cover img', '.detail-cover img']
    for selector in cover_selectors:
        elem = soup.select_one(selector)
        if elem:
            print(f"封面 (选择器: {selector}): {elem.get('src', elem.get('data-src', ''))[:80]}")
            break
    
    # 找章节列表
    chapter_selectors = ['.chapter-list', '.chapters', '.chapter-list-box', '.list-chapter']
    for selector in chapter_selectors:
        elements = soup.select(selector)
        if elements:
            print(f"\n章节列表 (选择器: {selector}): 找到 {len(elements)} 个容器")
            for elem in elements[:1]:
                links = elem.find_all('a')
                print(f"  章节数量: {len(links)}")
                if links:
                    print(f"  第一章: {links[0].get_text(strip=True)[:50]}")
                    print(f"  链接: {links[0].get('href', '')[:80]}")
            break

def main():
    if len(sys.argv) < 3:
        print("用法: python analyze_page.py <类型> <URL>")
        print("类型: list (列表页), category (分类页), detail (详情页), all (全部)")
        sys.exit(1)
    
    page_type = sys.argv[1]
    url = sys.argv[2]
    
    html = fetch_page(url)
    
    # 保存HTML
    with open('debug_page.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("\nHTML已保存到 debug_page.html")
    
    if page_type == 'list' or page_type == 'all':
        analyze_comic_list(html)
    if page_type == 'category' or page_type == 'all':
        analyze_categories(html)
    if page_type == 'detail' or page_type == 'all':
        analyze_detail_page(html)

if __name__ == '__main__':
    main()
