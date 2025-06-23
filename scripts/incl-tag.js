// scripts/incl-tag.js

const fs = require('fs');
const path = require('path');
const md = require('markdown-it')(); // npm install markdown-it 필요

console.log('[Hexo] incl 태그 로드됨');

hexo.extend.tag.register('incl', function(args) {
    const name = args[0];
    const filePath = path.join(hexo.source_dir, '_includes', `${name}.md`);

    if (!fs.existsSync(filePath)) {
        return `<!-- include not found: ${name} -->`;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    console.log(content)

    return md.render(content);
}, { async: false });
