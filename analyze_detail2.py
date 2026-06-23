#!/usr/bin/env python3
"""详细分析漫画详情页结构"""

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
print("详情页完整结构分析 - 斗破苍穹")
print("=" * 70)

# 查找所有包含 'de-' 开头的class的div（详情页相关）
print("\n【查找详情页容器】")
for div in soup.find_all('div', class_=lambda x: x and 'de-' in str(x)):
    cls = ' '.join(div.get('class', []))
    text = div.get_text(strip=True)[:50]
    print(f"  <div class='{cls}'>: {text}")

# 查找包含漫画信息的区域
print("\n【查找漫画信息区域】")
# 查找包含封面图的区域
for div in soup.find_all('div'):
    img = div.find('img')
    if img:
        src = img.get('src') or img.get('data-original') or ''
        if 'doupocangqiong' in src.lower() or 'cover' in src.lower():
            cls = ' '.join(div.get('class', []))
            parent = div.parent
            parent_cls = ' '.join(parent.get('class', [])) if parent else ''
            print(f"  找到封面图容器:")
            print(f"    父级: <div class='{parent_cls}'>")
            print(f"    当前: <div class='{cls}'>")
            print(f"    图片: {src}")

            # 打印父级的内容
            if parent:
                print(f"\n  父级容器HTML:")
                print(parent.prettify()[:2000])
            break

# 查找标题
print("\n【查找标题】")
for h in soup.find_all(['h1', 'h2', 'h3']):
    text = h.get_text(strip=True)
    if text and '斗破' in text:
        cls = ' '.join(h.get('class', []))
        parent = h.parent
        parent_cls = ' '.join(parent.get('class', [])) if parent else ''
        print(f"  找到标题: '{text}'")
        print(f"    元素: <{h.name} class='{cls}'>")
        print(f"    父级: <div class='{parent_cls}'>")

# 查找作者、状态等信息
print("\n【查找作者、状态等信息】")
for elem in soup.find_all(['p', 'span', 'li', 'div']):
    text = elem.get_text(strip=True)
    if any(k in text for k in ['作者', '状态', '更新', '人气', '分类', '简介', '标签']):
        cls = ' '.join(elem.get('class', []))
        if cls and len(text) < 100:
            print(f"  <{elem.name} class='{cls}'>: {text}")

# 打印章节列表容器完整结构
print("\n【章节列表容器完整结构】")
chapter_div = soup.find('div', class_='de-chapter')
if chapter_div:
    print(chapter_div.prettify()[:1000])

# 查找简介
print("\n【查找简介】")
for elem in soup.find_all(['p', 'div', 'span']):
    text = elem.get_text(strip=True)
    if '三十年河东' in text or '天才少年' in text:
        cls = ' '.join(elem.get('class', []))
        print(f"  <{elem.name} class='{cls}'>: {text[:100]}")