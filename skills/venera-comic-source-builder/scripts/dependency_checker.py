#!/usr/bin/env python3
import subprocess
import sys

REQUIRED_PACKAGES = [
    'requests',
    'beautifulsoup4',
    'fake-useragent'
]

def check_package(package):
    try:
        __import__(package)
        return True
    except ImportError:
        return False

def main():
    missing = []
    for pkg in REQUIRED_PACKAGES:
        if not check_package(pkg):
            missing.append(pkg)
    
    if missing:
        print(f"missing: {','.join(missing)}")
        sys.exit(1)
    else:
        print("ok")
        sys.exit(0)

if __name__ == '__main__':
    main()