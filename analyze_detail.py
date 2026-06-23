#!/usr/bin/env python3
"""分析漫画屋详情页"""

import requests
from bs4 import BeautifulSoup

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

# 测试详情页
test_urls = [
    ("斗破苍穹", "https://www.mhua5.com/index.php/comic/doupocangkong"),
    ("元尊", "https://www.mhua5.com/index.php/comic/yuanzun"),
]

for name, url in test_urls:
    print(f"\n{'='*70}")
    print(f"漫画: {name}")
    print(f"URL: {url}")
    print(f"{'='*70}")

    resp = requests.get(url, headers=headers, timeout=10)
    resp.encoding = 'utf-8'
    soup = BeautifulSoup(resp.text, 'html.parser')

    # 1. 查找漫画信息容器
    print("\n【漫画基本信息】")

    # 尝试不同的信息容器
    info_container = soup.find('div', class_=lambda x: x and 'comic-info' in str(x).lower())
    if not info_container:
        info_container = soup.find('div', class_=lambda x: x and 'detail' in str(x).lower())
    if not info_container:
        # 查找包含标题的容器
        for div in soup.find_all('div'):
            title = div.find('h1') or div.find('h2')
            if title:
                info_container = div
                break

    if info_container:
        print(f"  信息容器: <div class='{info_container.get('class', [])}'>")

        # 标题
        title = info_container.find('h1') or info_container.find('h2')
        if title:
            print(f"  标题: {title.get_text(strip=True)}")

        # 封面
        cover = info_container.find('img')
        if cover:
            print(f"  封面: {cover.get('src') or cover.get('data-original')}")

        # 作者、状态、标签等
        for p in info_container.find_all(['p', 'span', 'div']):
            text = p.get_text(strip=True)
            if any(k in text for k in ['作者', '状态', '更新', '人气', '分类', '标签']):
                cls = ' '.join(p.get('class', []))
                print(f"  [{cls}] {text[:50]}")

    # 2. 查找章节列表
    print("\n【章节列表】")

    # 查找章节容器
    chapter_container = soup.find('div', class_=lambda x: x and 'chapter' in str(x).lower())
    if not chapter_container:
        chapter_container = soup.find('ul', class_=lambda x: x and 'chapter' in str(x).lower())
    if not chapter_container:
        # 查找包含章节链接的容器
        for div in soup.find_all('div'):
            links = div.find_all('a', href=lambda x: x and '/chapter/' in x)
            if len(links) > 5:
                chapter_container = div
                break

    if chapter_container:
        cls = ' '.join(chapter_container.get('class', []))
        print(f"  章节容器: <{chapter_container.name} class='{cls}'>")

        chapters = chapter_container.find_all('a', href=lambda x: x and '/chapter/' in x)
        print(f"  章节总数: {len(chapters)}")
        print(f"  前5个章节:")
        for i, ch in enumerate(chapters[:5]):
            href = ch.get('href')
            text = ch.get_text(strip=True)
            chapter_id = href.split('/chapter/')[-1] if '/chapter/' in href else ''
            print(f"    [{i+1}] {text} → ID: {chapter_id}")

        print(f"  最后3个章节:")
        for i, ch in enumerate(chapters[-3:]):
            href = ch.get('href')
            text = ch.get_text(strip=True)
            chapter_id = href.split('/chapter/')[-1] if '/chapter/' in href else ''
            print(f"    [{len(chapters)-3+i}] {text} → ID: {chapter_id}")

    # 3. 查找简介
    print("\n【漫画简介】")
    desc_container = soup.find('div', class_=lambda x: x and 'desc' in str(x).lower())
    if not desc_container:
        desc_container = soup.find('p', class_=lambda x: x and 'desc' in str(x).lower())
    if desc_container:
        print(f"  简介: {desc_container.get_text(strip=True)[:100]}")

    # 4. 打印部分HTML结构
    print("\n【HTML片段】")
    # 找到主要内容区域
    main_content = soup.find('div', class_=lambda x: x and 'container' in str(x).lower())
    if main_content:
        print(main_content.prettify()[:1500])