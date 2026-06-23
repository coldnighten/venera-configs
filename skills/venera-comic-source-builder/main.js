#!/usr/bin/env node
const path = require('path');
const yargs = require('yargs');
const ComicSourceBuilder = require('./lib/builder');

function extractNameFromUrl(url) {
    try {
        const u = new URL(url);
        return u.hostname.replace(/^(www\.)?/, '').replace(/\.[a-z]+$/, '');
    } catch {
        return 'comic_source';
    }
}

async function main() {
    const argv = yargs
        .option('url', {
            describe: '漫画网站URL',
            type: 'string',
            demandOption: true
        })
        .option('name', {
            describe: '网站名称',
            type: 'string'
        })
        .option('key', {
            describe: '源Key',
            type: 'string'
        })
        .option('version', {
            describe: '版本号',
            type: 'string',
            default: '1.0.0'
        })
        .option('need-login', {
            describe: '是否需要登录',
            type: 'boolean',
            default: false
        })
        .option('backup-domains', {
            describe: '备用域名（逗号分隔）',
            type: 'string',
            default: ''
        })
        .help()
        .argv;

    let name = argv.name || extractNameFromUrl(argv.url);
    let key = argv.key || name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    let backupDomains = argv.backupDomains ? argv.backupDomains.split(',').map(s => s.trim()) : [];

    const builder = new ComicSourceBuilder({
        url: argv.url,
        name,
        key,
        version: argv.version,
        needLogin: argv.needLogin,
        backupDomains
    });

    try {
        await builder.build();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ 生成失败:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };