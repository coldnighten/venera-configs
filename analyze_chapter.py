#!/usr/bin/env python3
"""分析漫画章节页图片"""

import requests
from bs4 import BeautifulSoup
import re

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

# 测试章节页
test_urls = [
    ("斗破苍穹 第01话", "https://www.mhua5.com/index.php/chapter/196437"),
    ("斗破苍穹 第519回", "https://www.mhua5.com/index.php/chapter/3385184"),
]

for name, url in test_urls:
    print(f"\n{'='*70}")
    print(f"章节: {name}")
    print(f"URL: {url}")
    print(f"{'='*70}")

    resp = requests.get(url, headers=headers, timeout=10)
    resp.encoding = 'utf-8'
    soup = BeautifulSoup(resp.text, 'html.parser')

    print(f"  状态: {resp.status_code}")

    # 1. 查找图片容器
    print("\n【查找图片容器】")
    for div in soup.find_all('div', class_=lambda x: x and 'comic' in str(x).lower()):
        cls = ' '.join(div.get('class', []))
        imgs = div.find_all('img')
        if imgs:
            print(f"  <div class='{cls}'> 包含 {len(imgs)} 个图片")
            for i, img in enumerate(imgs[:3]):
                src = img.get('src') or img.get('data-original') or img.get('data-src')
                print(f"    [{i+1}] {src}")

    # 2. 查找所有图片
    print("\n【所有图片】")
    all_imgs = soup.find_all('img')
    print(f"  图片总数: {len(all_imgs)}")
    comic_imgs = []
    for img in all_imgs:
        src = img.get('src') or img.get('data-original') or img.get('data-src')
        if src and ('mkzcdn' in src or 'baozimh' in src):
            comic_imgs.append(src)
    print(f"  漫画图片数: {len(comic_imgs)}")
    for i, src in enumerate(comic_imgs[:5]):
        print(f"    [{i+1}] {src}")

    # 3. 查找 script 标签中的图片数据
    print("\n【Script中的图片数据】")
    scripts = soup.find_all('script')
    for script in scripts:
        content = script.string or ''
        if 'image' in content.lower() or 'chapter' in content.lower() or 'page' in content.lower():
            print(f"  Script片段 (前500字符):")
            print(f"    {content[:500]}")

            # 尝试匹配图片URL
            matches = re.findall(r'https?://[^\s"\']+mkzcdn[^\s"\']+', content)
            if matches:
                print(f"  找到 {len(matches)} 个图片URL")
                for m in matches[:3]:
                    print(f"    {m}")

    # 4. 查找阅读容器
    print("\n【阅读容器】")
    for div in soup.find_all('div'):
        cls = ' '.join(div.get('class', []))
        if 'read' in cls.lower() or 'viewer' in cls.lower() or 'content' in cls.lower():
            text = div.get_text(strip=True)[:30]
            print(f"  <div class='{cls}'>: {text}")

    # 5. 打印页面HTML片段
    print("\n【页面HTML片段】")
    # 找主要内容区域
    body = soup.find('body')
    if body:
        # 找到主要内容
        for div in body.find_all('div', recursive=False):
            cls = ' '.join(div.get('class', []))
            if 'container' in cls.lower() or 'main' in cls.lower() or 'chapter' in cls.lower():
                print(div.prettify()[:1000])
                break