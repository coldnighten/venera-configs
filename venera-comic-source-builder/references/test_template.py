#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
漫画源测试脚本模板

用法：
1. 修改 BASE_URL 为目标网站地址
2. 运行脚本进行测试
"""

import re
import sys
import json
from typing import List, Dict, Any, Optional

try:
    import requests
except ImportError:
    print("请先安装 requests: pip install requests")
    sys.exit(1)


class ComicSourceTester:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        })
        self.results = []

    def test_explore(self, url: Optional[str] = None) -> List[Dict]:
        """测试探索页"""
        url = url or self.base_url
        print(f"\n测试探索页: {url}")

        try:
            resp = self.session.get(url, timeout=10)
            resp.raise_for_status()

            comics = self.extract_comics_from_html(resp.text)

            print(f"  ✅ 提取到 {len(comics)} 个漫画")
            if comics:
                print(f"  示例: {comics[0]}")

            self.results.append({
                'type': 'explore',
                'url': url,
                'count': len(comics),
                'success': len(comics) > 0
            })

            return comics
        except Exception as e:
            print(f"  ❌ 错误: {e}")
            self.results.append({
                'type': 'explore',
                'url': url,
                'error': str(e),
                'success': False
            })
            return []

    def test_search(self, keyword: str = "测试") -> List[Dict]:
        """测试搜索功能"""
        search_url = f"{self.base_url}/search?q={keyword}"
        print(f"\n测试搜索: {search_url}")

        try:
            resp = self.session.get(search_url, timeout=10)
            resp.raise_for_status()

            comics = self.extract_comics_from_html(resp.text)

            print(f"  ✅ 提取到 {len(comics)} 个漫画")
            if comics:
                print(f"  示例: {comics[0]}")

            self.results.append({
                'type': 'search',
                'url': search_url,
                'keyword': keyword,
                'count': len(comics),
                'success': len(comics) > 0
            })

            return comics
        except Exception as e:
            print(f"  ❌ 错误: {e}")
            self.results.append({
                'type': 'search',
                'url': search_url,
                'error': str(e),
                'success': False
            })
            return []

    def test_detail(self, comic_id: str) -> Optional[Dict]:
        """测试详情页"""
        detail_url = f"{self.base_url}/comic/{comic_id}"
        print(f"\n测试详情页: {detail_url}")

        try:
            resp = self.session.get(detail_url, timeout=10)
            resp.raise_for_status()

            info = self.extract_detail_info(resp.text)

            print(f"  ✅ 标题: {info.get('title', 'N/A')}")
            print(f"  ✅ 章节数: {len(info.get('chapters', {}))}")

            self.results.append({
                'type': 'detail',
                'url': detail_url,
                'title': info.get('title'),
                'chapter_count': len(info.get('chapters', {})),
                'success': True
            })

            return info
        except Exception as e:
            print(f"  ❌ 错误: {e}")
            self.results.append({
                'type': 'detail',
                'url': detail_url,
                'error': str(e),
                'success': False
            })
            return None

    def test_chapter(self, chapter_id: str) -> List[str]:
        """测试章节页"""
        chapter_url = f"{self.base_url}/chapter/{chapter_id}"
        print(f"\n测试章节页: {chapter_url}")

        try:
            resp = self.session.get(chapter_url, timeout=10)
            resp.raise_for_status()

            images = self.extract_images(resp.text)

            print(f"  ✅ 提取到 {len(images)} 张图片")
            if images:
                print(f"  示例: {images[0][:50]}...")

            self.results.append({
                'type': 'chapter',
                'url': chapter_url,
                'image_count': len(images),
                'success': len(images) > 0
            })

            return images
        except Exception as e:
            print(f"  ❌ 错误: {e}")
            self.results.append({
                'type': 'chapter',
                'url': chapter_url,
                'error': str(e),
                'success': False
            })
            return []

    def test_login(self, username: str, password: str) -> bool:
        """测试登录功能"""
        login_url = f"{self.base_url}/api/login?name={username}&pass={password}"
        print(f"\n测试登录: {login_url}")

        try:
            resp = self.session.get(login_url, timeout=10)
            resp.raise_for_status()

            data = resp.json()

            if data.get('code') == 1:
                print(f"  ✅ 登录成功")
                print(f"  用户: {data.get('user', {}).get('name', 'N/A')}")

                self.results.append({
                    'type': 'login',
                    'success': True
                })
                return True
            else:
                print(f"  ❌ 登录失败: {data.get('msg', '未知错误')}")

                self.results.append({
                    'type': 'login',
                    'error': data.get('msg'),
                    'success': False
                })
                return False
        except Exception as e:
            print(f"  ❌ 错误: {e}")
            self.results.append({
                'type': 'login',
                'error': str(e),
                'success': False
            })
            return False

    def test_favorite_add(self, comic_id: str) -> bool:
        """测试添加收藏"""
        fav_url = f"{self.base_url}/api/favadd?did={comic_id}"
        print(f"\n测试添加收藏: {fav_url}")

        try:
            resp = self.session.get(fav_url, timeout=10)
            resp.raise_for_status()

            data = resp.json()

            if data.get('code') == 1:
                print(f"  ✅ 收藏成功")
                return True
            else:
                print(f"  ❌ 收藏失败: {data.get('msg', '未知错误')}")
                return False
        except Exception as e:
            print(f"  ❌ 错误: {e}")
            return False

    def test_favorite_list(self) -> List[Dict]:
        """测试收藏列表"""
        fav_url = f"{self.base_url}/api/fav"
        print(f"\n测试收藏列表: {fav_url}")

        try:
            resp = self.session.get(fav_url, timeout=10)
            resp.raise_for_status()

            data = resp.json()

            if data.get('code') == 1:
                comics = data.get('data', [])
                print(f"  ✅ 获取到 {len(comics)} 部收藏漫画")
                return comics
            else:
                print(f"  ❌ 获取失败: {data.get('msg', '未知错误')}")
                return []
        except Exception as e:
            print(f"  ❌ 错误: {e}")
            return []

    def extract_comics_from_html(self, html: str) -> List[Dict]:
        """
        从 HTML 中提取漫画列表
        根据实际网站结构调整选择器
        """
        comics = []

        # 通用正则匹配
        # 1. 匹配包含漫画标题和链接的内容
        patterns = [
            r'href=["\'](/comic/[^"\']+)["\'][^>]*>([^<]+)<',
            r'data-id=["\'](\d+)["\'][^>]*>.*?title=["\']([^"\']+)["\']',
        ]

        for pattern in patterns:
            matches = re.findall(pattern, html, re.DOTALL)
            for match in matches[:10]:  # 限制数量
                if len(match) >= 2:
                    href, title = match[0], match[1]
                    title = title.strip()
                    if title and len(title) > 1:
                        comics.append({
                            'id': href.split('/')[-1] if '/' in href else href,
                            'title': title,
                            'href': href
                        })

        return comics

    def extract_detail_info(self, html: str) -> Dict:
        """
        从详情页 HTML 中提取信息
        根据实际网站结构调整
        """
        info = {
            'title': '',
            'cover': '',
            'description': '',
            'chapters': {}
        }

        # 提取标题
        title_match = re.search(r'<h1[^>]*>([^<]+)</h1>', html)
        if title_match:
            info['title'] = title_match.group(1).strip()

        # 提取章节
        chapter_patterns = [
            r'href=["\'](/chapter/[^"\']+)["\'][^>]*>([^<]+)<',
        ]

        for pattern in chapter_patterns:
            matches = re.findall(pattern, html)
            for href, title in matches[:100]:
                ch_id = href.split('/')[-1]
                info['chapters'][ch_id] = title.strip()

        return info

    def extract_images(self, html: str) -> List[str]:
        """
        从章节页 HTML 中提取图片列表
        根据实际网站结构调整
        """
        images = []

        # 提取图片 URL
        patterns = [
            r'src=["\'](https?://[^"\']+\.(?:jpg|png|webp)[^"\']*)["\']',
            r'data-src=["\'](https?://[^"\']+\.(?:jpg|png|webp)[^"\']*)["\']',
        ]

        for pattern in patterns:
            matches = re.findall(pattern, html, re.IGNORECASE)
            images.extend(matches)

        # 去重
        seen = set()
        unique_images = []
        for img in images:
            if img not in seen and 'logo' not in img.lower():
                seen.add(img)
                unique_images.append(img)

        return unique_images

    def print_summary(self):
        """打印测试总结"""
        print("\n" + "="*60)
        print("测试总结")
        print("="*60)

        total = len(self.results)
        success = sum(1 for r in self.results if r.get('success', False))

        print(f"\n总计: {total} 项测试, {success} 成功, {total - success} 失败")

        for r in self.results:
            status = "✅" if r.get('success') else "❌"
            print(f"{status} {r['type']}: {r.get('url', r.get('keyword', ''))}")
            if 'error' in r:
                print(f"   错误: {r['error']}")

        print()


def main():
    # ========== 配置区域 ==========
    BASE_URL = "https://example.com"  # 修改为实际网站地址

    # 测试搜索关键词
    TEST_KEYWORD = "测试"

    # 测试用的漫画 ID（从探索页或搜索结果获取）
    TEST_COMIC_ID = "test_comic"

    # 测试用的章节 ID
    TEST_CHAPTER_ID = "test_chapter"

    # 测试登录（可选）
    TEST_USERNAME = "your_username"
    TEST_PASSWORD = "your_password"

    # ========== 运行测试 ==========
    tester = ComicSourceTester(BASE_URL)

    # 1. 测试探索页
    tester.test_explore()

    # 2. 测试搜索
    tester.test_search(TEST_KEYWORD)

    # 3. 测试详情页
    tester.test_detail(TEST_COMIC_ID)

    # 4. 测试章节页
    tester.test_chapter(TEST_CHAPTER_ID)

    # 5. 测试登录（可选）
    # tester.test_login(TEST_USERNAME, TEST_PASSWORD)

    # 6. 测试收藏功能（可选，需要先登录）
    # tester.test_favorite_add(TEST_COMIC_ID)
    # tester.test_favorite_list()

    # 打印总结
    tester.print_summary()


if __name__ == "__main__":
    main()
