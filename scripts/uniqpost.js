const fs = require('fs');
const path = require('path');

hexo.extend.console.register('uniqpost', 'Create a new post with a 6-char lowercase+digit filename', function(args) {
    const postsDir = path.join(hexo.source_dir, '_posts');

    if (!fs.existsSync(postsDir)) {
        fs.mkdirSync(postsDir);
    }

    const generateFilename = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const firstChar = chars[Math.floor(Math.random() * 26)]; // 소문자
        let rest = '';
        for (let i = 0; i < 5; i++) {
            rest += chars[Math.floor(Math.random() * chars.length)];
        }
        return firstChar + rest;
    };

    const formatDate = (date) => {
        const pad = (n) => n.toString().padStart(2, '0');
        const yyyy = date.getFullYear();
        const mm = pad(date.getMonth() + 1);
        const dd = pad(date.getDate());
        const hh = pad(date.getHours());
        const min = pad(date.getMinutes());
        const ss = pad(date.getSeconds());
        return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    };

    let filename;
    let fullPath;
    do {
        filename = generateFilename();
        fullPath = path.join(postsDir, `${filename}.md`);
    } while (fs.existsSync(fullPath));

    const now = new Date();
    const frontMatter =
        `---\n` +
        `title: title ${formatDate(now)}  \n` +
        `date: ${formatDate(now)}\n` +
        `tags: [Blog]\n` +
        `categories: [Blog]\n` +
        `toc: true\n` +
        `---\n\n`;

    fs.writeFileSync(fullPath, frontMatter, 'utf8');
    console.log(`✅ Created: source/_posts/${filename}.md`);
});
