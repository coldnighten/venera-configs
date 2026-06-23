import os
import re
import subprocess
import json
from retry import retry

class ComicSourceBuilder:
    def __init__(self, options):
        self.options = options
        self.test_results = {}
        self.report = []
    
    def log(self, level, message):
        self.report.append({'type': level, 'message': message})
    
    async def check_dependencies(self):
        self.log('info', '检查Python依赖...')
        
        checker_path = os.path.join(os.path.dirname(__file__), 'scripts', 'dependency_checker.py')
        result = subprocess.run(['python3', checker_path], capture_output=True, text=True)
        
        if result.returncode != 0:
            missing = result.stdout.strip().replace('missing: ', '')
            self.log('warning', f'缺少依赖包: {missing}')
            raise RuntimeError(f'缺少Python依赖，请运行: pip install {missing}')
        else:
            self.log('success', 'Python依赖检查通过')
    
    async def run_tests(self):
        self.log('info', '\n开始运行测试...')
        
        python_script = os.path.join(os.path.dirname(__file__), 'scripts', 'comic_source_tester.py')
        args = [
            '--url', self.options['url'],
            '--name', self.options['name'],
            '--key', self.options['key'],
            '--version', self.options['version'],
            '--need-login', 'true' if self.options['need_login'] else 'false',
            '--backup-domains', ','.join(self.options['backup_domains'])
        ]
        
        async def run_test_once():
            result = subprocess.run(['python3', python_script] + args, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise RuntimeError(f'测试失败: {result.stderr}')
            
            try:
                return json.loads(result.stdout)
            except json.JSONDecodeError:
                raise RuntimeError('解析测试结果失败')
        
        def on_retry(attempt, max_retry, error):
            self.log('warning', f'测试失败，第 {attempt}/{max_retry} 次重试: {error}')
        
        self.test_results = await retry(run_test_once, max_retries=3, delay_ms=3000, on_retry=on_retry)
    
    def generate_source(self):
        self.log('info', '\n开始生成漫画源文件...')
        
        template_path = os.path.join(os.path.dirname(__file__), 'references', 'template.js')
        with open(template_path, 'r', encoding='utf-8') as f:
            template = f.read()
        
        source_code = template
        source_code = source_code.replace('{{NAME}}', self.options['name'])
        source_code = source_code.replace('{{KEY}}', self.options['key'])
        source_code = source_code.replace('{{VERSION}}', self.options['version'])
        source_code = source_code.replace('{{URL}}', self.options['url'])
        
        source_code = self.fill_explore_section(source_code)
        source_code = self.fill_search_section(source_code)
        source_code = self.fill_category_section(source_code)
        source_code = self.fill_comic_section(source_code)
        
        output_path = os.path.join(os.getcwd(), f"{self.options['key']}.js")
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(source_code)
        
        self.log('success', f'漫画源文件已生成: {output_path}')
        self.output_path = output_path
    
    def fill_explore_section(self, source_code):
        if not self.test_results.get('explore'):
            return source_code
        
        explore_config = self.test_results['explore']
        explore_code = '    explore = [\n'
        
        for section in explore_config['sections']:
            explore_code += f'''        {{
            title: "{section['title']}",
            type: "{section.get('type', 'multiPartPage')}",
            load: async (page) => {{
                let res = await Network.get("{section['url']}")
                if (res.status !== 200) throw "请求失败"
                let document = new HtmlDocument(res.body)
                let comics = []
                document.querySelectorAll("{section['selector']}").forEach(el => {{
                    comics.push(new Comic({{
                        id: el.getAttribute("{section['idAttr']}"),
                        title: el.querySelector("{section['titleSelector']}")?.text || "",
                        cover: el.querySelector("{section['coverSelector']}")?.getAttribute("{section['coverAttr']}") || "",
                    }}))
                }})
                return {{ "{section['key']}": comics }}
            }}
        }}\n'''
        
        explore_code += '    ]\n'
        return source_code.replace('{{EXPLORE_SECTION}}', explore_code)
    
    def fill_search_section(self, source_code):
        if not self.test_results.get('search'):
            return source_code
        
        search_config = self.test_results['search']
        search_code = f'''    search = {{
        load: async (keyword, options, page) => {{
            let url = "{search_config['url']}".replace("{{keyword}}", encodeURIComponent(keyword))
            let res = await Network.get(url)
            if (res.status !== 200) throw "请求失败"
            let document = new HtmlDocument(res.body)
            let comics = []
            document.querySelectorAll("{search_config['selector']}").forEach(el => {{
                comics.push(new Comic({{
                    id: el.getAttribute("{search_config['idAttr']}"),
                    title: el.querySelector("{search_config['titleSelector']}")?.text || "",
                    cover: el.querySelector("{search_config['coverSelector']}")?.getAttribute("{search_config['coverAttr']}") || "",
                }}))
            }})
            return {{ comics: comics, maxPage: 10 }}
        }}
    }}\n'''
        
        return source_code.replace('{{SEARCH_SECTION}}', search_code)
    
    def fill_category_section(self, source_code):
        if not self.test_results.get('category'):
            return source_code
        
        category_config = self.test_results['category']
        category_code = '    category = {\n        title: "分类",\n        parts: [\n'
        
        for cat in category_config['categories']:
            category_code += f'''            {{
                name: "{cat['name']}",
                type: "fixed",
                categories: [
'''
            for item in cat['items']:
                category_code += f'''                    {{
                        label: "{item['label']}",
                        target: {{
                            page: "category",
                            attributes: {{ category: "{item['value']}" }}
                        }}
                    }},
'''
            category_code += '                ]\n            },\n'
        
        category_code += '        ]\n    }\n'
        return source_code.replace('{{CATEGORY_SECTION}}', category_code)
    
    def fill_comic_section(self, source_code):
        if not self.test_results.get('comic'):
            return source_code
        
        comic_config = self.test_results['comic']
        comic_code = f'''    comic = {{
        loadInfo: async (id) => {{
            let url = "{comic_config['infoUrl']}".replace("{{id}}", id)
            let res = await Network.get(url)
            if (res.status !== 200) throw "请求失败"
            let document = new HtmlDocument(res.body)
            let title = document.querySelector("{comic_config['titleSelector']}")?.text || ""
            let cover = document.querySelector("{comic_config['coverSelector']}")?.getAttribute("{comic_config['coverAttr']}") || ""
            let author = document.querySelector("{comic_config['authorSelector']}")?.text || ""
            let description = document.querySelector("{comic_config['descSelector']}")?.text || ""
            let chapters = []
            document.querySelectorAll("{comic_config['chapterSelector']}").forEach(el => {{
                chapters.push(new Chapter({{
                    id: el.getAttribute("{comic_config['chapterIdAttr']}"),
                    title: el.querySelector("{comic_config['chapterTitleSelector']}")?.text || "",
                }}))
            }})
            return new ComicDetails({{
                id: id,
                title: title,
                cover: cover,
                author: author,
                description: description,
                chapters: chapters.reverse()
            }})
        }},
        loadEp: async (comicId, epId) => {{
            let url = "{comic_config['epUrl']}".replace("{{comicId}}", comicId).replace("{{epId}}", epId)
            let res = await Network.get(url)
            if (res.status !== 200) throw "请求失败"
            let document = new HtmlDocument(res.body)
            let images = []
            document.querySelectorAll("{comic_config['imageSelector']}").forEach(el => {{
                let src = el.getAttribute("{comic_config['imageAttr']}")
                if (src) images.push(src)
            }})
            return {{ images: images }}
        }}
    }}\n'''
        
        return source_code.replace('{{COMIC_SECTION}}', comic_code)
    
    def show_report(self):
        print('\n' + '='*60)
        print('          漫画源生成报告')
        print('='*60)
        
        for item in self.report:
            prefix = '  '
            if item['type'] == 'success':
                prefix = '  ✅ '
            elif item['type'] == 'error':
                prefix = '  ❌ '
            elif item['type'] == 'warning':
                prefix = '  ⚠️ '
            elif item['type'] == 'info':
                prefix = '  ℹ️ '
            print(f'{prefix}{item["message"]}')
        
        print('='*60)
        if hasattr(self, 'output_path'):
            print(f'\n生成的源文件: {self.output_path}')
    
    async def build(self):
        try:
            await self.check_dependencies()
            await self.run_tests()
            self.generate_source()
            self.show_report()
            return {'success': True, 'output_path': self.output_path}
        except Exception as error:
            self.log('error', f'构建失败: {error}')
            self.show_report()
            raise