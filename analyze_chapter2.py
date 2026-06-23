#!/usr/bin/env python3
"""深入分析章节页图片加载"""

import requests
from bs4 import BeautifulSoup
import re

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

url = "https://www.mhua5.com/index.php/chapter/196437"
resp = requests.get(url, headers=headers, timeout=15)
resp.encoding = 'utf-8'
soup = BeautifulSoup(resp.text, 'html.parser')

print("=" * 70)
print("章节页图片加载分析")
print("=" * 70)

# 1. 查找阅读容器
print("\n【阅读容器】")
read_container = soup.find('div', class_='read-container')
if read_container:
    print(f"  data-type: {read_container.get('data-type')}")
    print(read_container.prettify()[:2000])

# 2. 查找所有 script 标签内容
print("\n【所有 Script 内容】")
scripts = soup.find_all('script')
for i, script in enumerate(scripts):
    content = script.string or ''
    if content and len(content) > 50:
        print(f"\n  Script [{i}] (前800字符):")
        print(f"  {content[:800]}")

# 3. 查找图片相关的JavaScript变量
print("\n【查找图片变量】")
html_text = resp.text
# 查找常见的图片变量名
patterns = [
    r'var\s+images\s*=\s*["\']([^"\']+)["\']',
    r'var\s+imageArr\s*=\s*\[([^\]]+)\]',
    r'var\s+pageImage\s*=\s*["\']([^"\']+)["\']',
    r'chapterImages\s*=\s*\[([^\]]+)\]',
    r'imgList\s*=\s*\[([^\]]+)\]',
    r'image_list\s*=\s*\[([^\]]+)\]',
]

for p in patterns:
    matches = re.findall(p, html_text)
    if matches:
        print(f"  匹配 {p}:")
        for m in matches[:3]:
            print(f"    {m[:100]}")

# 4. 查找包含图片URL的变量
print("\n【查找图片URL模式】")
# 匹配 http开头，包含图片相关关键词的URL
img_url_pattern = r'https?://[^\s"\'<>]+(?:\.jpg|\.png|\.gif|\.webp)'
matches = re.findall(img_url_pattern, html_text)
print(f"  找到 {len(matches)} 个图片URL")
for m in matches[:10]:
    print(f"    {m}")

# 5. 查找阅读区域
print("\n【阅读区域】")
for div in soup.find_all('div'):
    cls = ' '.join(div.get('class', []))
    if 'rd-' in cls or 'read-' in cls:
        id_attr = div.get('id', '')
        print(f"  <div class='{cls}' id='{id_attr}'>")
        # 查找内部图片
        imgs = div.find_all('img')
        if imgs:
            print(f"    包含 {len(imgs)} 个图片")
            for img in imgs[:3]:
                src = img.get('src') or img.get('data-src') or img.get('data-original')
                print(f"      {src}")

# 6. 查找页面计数
print("\n【页面计数】")
page_count = soup.find('span', class_='count')
if page_count:
    print(f"  总页数: {page_count.get_text(strip=True)}")

# 7. 查找API或数据URL
print("\n【查找API/数据URL】")
api_patterns = [
    r'https?://[^\s"\'<>]+api[^\s"\'<>]*',
    r'https?://[^\s"\'<>]+data[^\s"\'<>]*',
    r'/index\.php/[^\s"\'<>]+image[^\s"\'<>]*',
]
for p in api_patterns:
    matches = re.findall(p, html_text)
    if matches:
        print(f"  匹配 {p}:")
        for m in matches[:5]:
            print(f"    {m}")