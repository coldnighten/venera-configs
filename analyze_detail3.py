#!/usr/bin/env python3
"""解析详情页各个字段"""

import requests
from bs4 import BeautifulSoup

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

url = "https://www.mhua5.com/index.php/comic/doupocangkong"
resp = requests.get(url, headers=headers, timeout=10)
resp.encoding = 'utf-8'
soup = BeautifulSoup(resp.text, 'html.parser')

print("=" * 70)
print("详情页字段解析")
print("=" * 70)

# 1. 信息容器
info_box = soup.find('div', class_='de-info__box')
if info_box:
    print("\n【信息容器 de-info__box】")
    print(info_box.prettify()[:1500])

# 2. 封面
print("\n【封面】")
cover_div = soup.find('div', class_='de-info__cover')
if cover_div:
    img = cover_div.find('img')
    if img:
        print(f"  封面URL: {img.get('src') or img.get('data-original')}")

# 3. 标题
print("\n【标题】")
# 在 de-info__box 中查找
if info_box:
    # 查找第一个包含文本的元素作为标题
    for elem in info_box.find_all(['h1', 'h2', 'h3', 'p', 'span', 'div']):
        text = elem.get_text(strip=True)
        if '斗破' in text and len(text) < 20:
            cls = ' '.join(elem.get('class', []))
            print(f"  <{elem.name} class='{cls}'>: {text}")
            break

# 4. 作者
print("\n【作者】")
if info_box:
    for elem in info_box.find_all(['p', 'span', 'div']):
        text = elem.get_text(strip=True)
        if '知音漫客' in text or '任翔' in text:
            cls = ' '.join(elem.get('class', []))
            print(f"  <{elem.name} class='{cls}'>: {text}")

# 5. 状态信息
print("\n【状态信息 comic-status】")
status_div = soup.find('div', class_='comic-status')
if status_div:
    print(f"  内容: {status_div.get_text(strip=True)}")
    # 解析各个字段
    spans = status_div.find_all('span')
    for s in spans:
        cls = ' '.join(s.get('class', []))
        text = s.get_text(strip=True)
        print(f"    <span class='{cls}'>: {text}")

# 6. 简介
print("\n【简介】")
intro_div = soup.find('div', class_='comic-intro')
if intro_div:
    intro_p = intro_div.find('p', class_='intro-total')
    if intro_p:
        print(f"  简介: {intro_p.get_text(strip=True)[:100]}")

# 7. 标签/题材
print("\n【标签】")
# 查找包含题材的区域
for elem in soup.find_all(['a', 'span', 'div']):
    text = elem.get_text(strip=True)
    href = elem.get('href', '')
    if '/category/tags/' in href or '/category/list/' in href:
        cls = ' '.join(elem.get('class', []))
        print(f"  <{elem.name} class='{cls}'>: [{text}]({href})")

# 8. 章节列表
print("\n【章节列表】")
chapter_list = soup.find('ul', class_='chapter__list-box')
if chapter_list:
    chapters = chapter_list.find_all('li', class_='chapter__item')
    print(f"  章节总数: {len(chapters)}")
    print(f"  前5个:")
    for i, ch in enumerate(chapters[:5]):
        link = ch.find('a')
        href = link.get('href') if link else ''
        text = link.get_text(strip=True) if link else ''
        ch_id = href.split('/chapter/')[-1] if '/chapter/' in href else ''
        print(f"    [{i+1}] {text} → ID: {ch_id}")

# 9. 最新章节
print("\n【最新章节】")
update_span = soup.find('span', class_='update-time')
if update_span:
    print(f"  最新: {update_span.get_text(strip=True)}")