const fs = require('fs');
const path = require('path');

hexo.extend.tag.register('include_md', function(args) {
    const filename = args[0];
    const filepath = path.join(hexo.source_dir, filename);

    if (!fs.existsSync(filepath)) {
        return `<!-- include_md not found: ${filename} -->`;
    }

    let content = fs.readFileSync(filepath, 'utf8');

    // front-matter 제거
    if (content.startsWith('---')) {
        const parts = content.split('---');
        if (parts.length >= 3) {
            content = parts.slice(2).join('---').trim();
        }
    }

    // 비동기 렌더링을 동기식으로 변환
    const renderResult = hexo.render.renderSync({
        text: content,
        path: filename  // 중요! 이렇게 해야 플러그인 태그 처리됨
    });

    return renderResult;
}, { async: false });
