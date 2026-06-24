#!/usr/bin/env python3
"""
index.json 管理工具
用于添加、更新、检查漫画源索引文件
"""

import json
import sys
import os

def load_index(filepath):
    """加载 index.json 文件"""
    if not os.path.exists(filepath):
        return None, f"文件不存在: {filepath}"
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        if not isinstance(data, list):
            return None, "格式错误：根节点不是数组"
        return data, None
    except json.JSONDecodeError as e:
        return None, f"JSON 解析错误: {e}"
    except Exception as e:
        return None, f"读取文件错误: {e}"

def save_index(filepath, data):
    """保存 index.json 文件"""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        return True, None
    except Exception as e:
        return False, f"保存文件错误: {e}"

def check_exists(data, key):
    """检查 key 是否已存在"""
    for i, item in enumerate(data):
        if item.get('key') == key:
            return True, i
    return False, -1

def validate_entry(entry):
    """验证条目格式"""
    required_fields = ['name', 'fileName', 'key', 'version']
    missing = []
    for field in required_fields:
        if field not in entry:
            missing.append(field)
    
    if missing:
        return False, f"缺少必填字段: {', '.join(missing)}"
    
    return True, None

def add_entry(data, entry):
    """添加新条目"""
    valid, err = validate_entry(entry)
    if not valid:
        return None, err
    
    exists, idx = check_exists(data, entry['key'])
    if exists:
        return None, f"key '{entry['key']}' 已存在（索引 {idx}），请使用 update 命令"
    
    data.append(entry)
    return data, None

def update_entry(data, entry):
    """更新条目"""
    valid, err = validate_entry(entry)
    if not valid:
        return None, err
    
    exists, idx = check_exists(data, entry['key'])
    if not exists:
        return None, f"key '{entry['key']}' 不存在，请使用 add 命令"
    
    data[idx] = entry
    return data, None

def generate_entry(name, filename, key, version, description=None):
    """生成条目"""
    entry = {
        "name": name,
        "fileName": filename,
        "key": key,
        "version": version
    }
    if description:
        entry["description"] = description
    return entry

def print_entry(entry):
    """打印单个条目"""
    print(json.dumps(entry, ensure_ascii=False, indent=4))

def main():
    if len(sys.argv) < 2:
        print("用法:")
        print("  python manage_index.py check <index.json路径>")
        print("  python manage_index.py generate <name> <fileName> <key> <version> [description]")
        print("  python manage_index.py add <index.json路径> <name> <fileName> <key> <version> [description]")
        print("  python manage_index.py update <index.json路径> <name> <fileName> <key> <version> [description]")
        print("  python manage_index.py exists <index.json路径> <key>")
        print("  python manage_index.py list <index.json路径>")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == 'check':
        if len(sys.argv) < 3:
            print("错误：缺少 index.json 路径")
            sys.exit(1)
        filepath = sys.argv[2]
        data, err = load_index(filepath)
        if err:
            print(f"❌ {err}")
            sys.exit(1)
        print(f"✅ index.json 格式正确，共 {len(data)} 个条目")
        sys.exit(0)
    
    elif command == 'generate':
        if len(sys.argv) < 6:
            print("错误：缺少参数")
            sys.exit(1)
        name = sys.argv[2]
        filename = sys.argv[3]
        key = sys.argv[4]
        version = sys.argv[5]
        description = sys.argv[6] if len(sys.argv) > 6 else None
        
        entry = generate_entry(name, filename, key, version, description)
        print_entry(entry)
        sys.exit(0)
    
    elif command == 'add':
        if len(sys.argv) < 7:
            print("错误：缺少参数")
            sys.exit(1)
        filepath = sys.argv[2]
        name = sys.argv[3]
        filename = sys.argv[4]
        key = sys.argv[5]
        version = sys.argv[6]
        description = sys.argv[7] if len(sys.argv) > 7 else None
        
        data, err = load_index(filepath)
        if err:
            print(f"❌ {err}")
            sys.exit(1)
        
        entry = generate_entry(name, filename, key, version, description)
        new_data, err = add_entry(data, entry)
        if err:
            print(f"❌ {err}")
            sys.exit(1)
        
        success, err = save_index(filepath, new_data)
        if err:
            print(f"❌ {err}")
            sys.exit(1)
        
        print(f"✅ 已添加条目: {name} ({key})")
        sys.exit(0)
    
    elif command == 'update':
        if len(sys.argv) < 7:
            print("错误：缺少参数")
            sys.exit(1)
        filepath = sys.argv[2]
        name = sys.argv[3]
        filename = sys.argv[4]
        key = sys.argv[5]
        version = sys.argv[6]
        description = sys.argv[7] if len(sys.argv) > 7 else None
        
        data, err = load_index(filepath)
        if err:
            print(f"❌ {err}")
            sys.exit(1)
        
        entry = generate_entry(name, filename, key, version, description)
        new_data, err = update_entry(data, entry)
        if err:
            print(f"❌ {err}")
            sys.exit(1)
        
        success, err = save_index(filepath, new_data)
        if err:
            print(f"❌ {err}")
            sys.exit(1)
        
        print(f"✅ 已更新条目: {name} ({key})")
        sys.exit(0)
    
    elif command == 'exists':
        if len(sys.argv) < 4:
            print("错误：缺少参数")
            sys.exit(1)
        filepath = sys.argv[2]
        key = sys.argv[3]
        
        data, err = load_index(filepath)
        if err:
            print(f"❌ {err}")
            sys.exit(1)
        
        exists, idx = check_exists(data, key)
        if exists:
            print(f"✅ key '{key}' 存在，索引 {idx}")
            print_entry(data[idx])
        else:
            print(f"❌ key '{key}' 不存在")
        sys.exit(0)
    
    elif command == 'list':
        if len(sys.argv) < 3:
            print("错误：缺少 index.json 路径")
            sys.exit(1)
        filepath = sys.argv[2]
        
        data, err = load_index(filepath)
        if err:
            print(f"❌ {err}")
            sys.exit(1)
        
        print(f"共 {len(data)} 个条目:")
        for i, item in enumerate(data):
            print(f"  [{i}] {item.get('name', '?')} ({item.get('key', '?')}) - v{item.get('version', '?')}")
        sys.exit(0)
    
    else:
        print(f"未知命令: {command}")
        sys.exit(1)

if __name__ == '__main__':
    main()
