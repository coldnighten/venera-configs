#!/usr/bin/env python3
import argparse
import asyncio
import re
from builder import ComicSourceBuilder

def extract_name_from_url(url):
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        return re.sub(r'^(www\.)?', '', parsed.hostname).replace('.com', '').replace('.net', '').replace('.org', '')
    except:
        return 'comic_source'

def main():
    parser = argparse.ArgumentParser(description='快速生成Venera漫画阅读器的漫画源配置文件')
    parser.add_argument('--url', required=True, help='漫画网站URL')
    parser.add_argument('--name', help='网站名称（默认从URL提取）')
    parser.add_argument('--key', help='源Key（默认小写网站名）')
    parser.add_argument('--version', default='1.0.0', help='版本号（默认1.0.0）')
    parser.add_argument('--need-login', action='store_true', default=False, help='是否需要登录')
    parser.add_argument('--backup-domains', default='', help='备用域名，逗号分隔')
    
    args = parser.parse_args()
    
    name = args.name or extract_name_from_url(args.url)
    key = args.key or re.sub(r'[^a-z0-9]', '_', name.lower())
    backup_domains = [d.strip() for d in args.backup_domains.split(',')] if args.backup_domains else []
    
    options = {
        'url': args.url,
        'name': name,
        'key': key,
        'version': args.version,
        'need_login': args.need_login,
        'backup_domains': backup_domains
    }
    
    builder = ComicSourceBuilder(options)
    
    try:
        asyncio.run(builder.build())
    except Exception as error:
        print(f'\n❌ 生成失败: {error}')
        exit(1)

if __name__ == '__main__':
    main()