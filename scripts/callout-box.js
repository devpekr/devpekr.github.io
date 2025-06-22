'use strict';

const types = {
    info: '💬',
    tip: '💡',
    warning: '⚠️',
    danger: '🚫'
};

hexo.extend.tag.register('callout', function(args, content) {
    const options = {};
    args.forEach(arg => {
        const [key, val] = arg.split(':');
        options[key.trim()] = val.replace(/^"|"$/g, '').trim(); // 따옴표 제거
    });

    const type = options.type || 'info';
    const title = options.title || type.charAt(0).toUpperCase() + type.slice(1);
    const icon = types[type] || '';

    return `
<div class="callout callout-${type}">
  <strong class="callout-title">${icon} ${title}</strong>
  <div class="callout-content">
    ${hexo.render.renderSync({text: content, engine: 'markdown'})}
  </div>
</div>
  `;
}, {ends: true});
