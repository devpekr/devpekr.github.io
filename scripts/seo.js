'use strict';

const {
  getSeoConfig,
  escapeHtml,
  buildCanonicalUrl,
  isPageNoindex,
  buildTitle,
  buildDescription,
  buildImage,
  toIsoDate,
  buildJsonLdBlocks
} = require('../tools/seo-lib');

hexo.extend.helper.register('seo_lang', function () {
  return getSeoConfig(hexo.config).language || 'ko';
});

hexo.extend.helper.register('seo_title', function (page) {
  return buildTitle(getSeoConfig(hexo.config), page || this.page, this);
});

hexo.extend.helper.register('seo_meta_tags', function (page) {
  const seo = getSeoConfig(hexo.config);
  if (!seo.enable) return '';
  const target = page || this.page;
  const title = buildTitle(seo, target, this);
  const desc = buildDescription(seo, target, this);
  const canonical = buildCanonicalUrl(seo, target);
  const noindex = isPageNoindex(seo, target, this);
  const robots = noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  const image = buildImage(seo, target);
  const isPostPage = typeof this.is_post === 'function' && this.is_post();
  const is404 = String((target && target.path) || '') === '404.html' || (target && target.layout === '404');

  const lines = [
    `<meta name="description" content="${escapeHtml(desc)}" />`,
    `<meta name="robots" content="${robots}" />`
  ];
  if (!is404) {
    lines.push(`<link rel="canonical" href="${escapeHtml(canonical)}" />`);
  }
  if (seo.verification.google) {
    lines.push(`<meta name="google-site-verification" content="${escapeHtml(seo.verification.google)}" />`);
  }
  if (seo.verification.naver) {
    lines.push(`<meta name="naver-site-verification" content="${escapeHtml(seo.verification.naver)}" />`);
  }
  if (seo.verification.bing) {
    lines.push(`<meta name="msvalidate.01" content="${escapeHtml(seo.verification.bing)}" />`);
  }

  lines.push(
    `<meta property="og:type" content="${isPostPage ? 'article' : 'website'}" />`,
    `<meta property="og:locale" content="${escapeHtml(seo.locale)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(seo.site_name)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(desc)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta name="twitter:card" content="${escapeHtml(seo.twitter_card)}" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(desc)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`
  );

  if (isPostPage && target) {
    const published = toIsoDate(target.date);
    const modified = toIsoDate(target.updated || target.date);
    if (published) lines.push(`<meta property="article:published_time" content="${escapeHtml(published)}" />`);
    if (modified) lines.push(`<meta property="article:modified_time" content="${escapeHtml(modified)}" />`);
    lines.push(`<meta property="article:author" content="${escapeHtml(target.author || seo.author)}" />`);
  }

  return lines.join('\n    ');
});

hexo.extend.helper.register('seo_json_ld', function (page) {
  const seo = getSeoConfig(hexo.config);
  if (!seo.enable || !seo.json_ld) return '';
  const blocks = buildJsonLdBlocks(seo, page || this.page, this);
  return blocks
    .map(b => `<script type="application/ld+json">${JSON.stringify(b).replace(/<\/script>/gi, '<\\/script>')}</script>`)
    .join('\n    ');
});

hexo.extend.helper.register('seo_related_posts', function (post, limit) {
  const max = limit || 5;
  if (!post || !this.site || !this.site.posts) return [];
  const all = this.site.posts.sort('date', -1).toArray();
  const postCats = new Set((post.categories && post.categories.toArray ? post.categories.toArray() : []).map(c => c.name));
  const postTags = new Set((post.tags && post.tags.toArray ? post.tags.toArray() : []).map(t => t.name));

  return all
    .filter(item => item._id !== post._id && item.published !== false && item.noindex !== true)
    .map(item => {
      let score = 0;
      const cats = item.categories && item.categories.toArray ? item.categories.toArray() : [];
      const tags = item.tags && item.tags.toArray ? item.tags.toArray() : [];
      cats.forEach(c => { if (postCats.has(c.name)) score += 3; });
      tags.forEach(t => { if (postTags.has(t.name)) score += 1; });
      return { item, score };
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.item.date - a.item.date)
    .slice(0, max)
    .map(entry => entry.item);
});
