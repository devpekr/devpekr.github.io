'use strict';

const {
  getSeoConfig,
  buildCanonicalUrl,
  toAbsoluteUrl,
  toIsoDate,
  stripHtml
} = require('../tools/seo-lib');

function escapeXml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isVerificationFile(p) {
  return /^(google[a-z0-9]+\.html|naver[a-z0-9]+\.html)$/i.test(String(p || '').replace(/^\/+/, ''));
}

function latestDateIso(items) {
  let latest = 0;
  (items || []).forEach(item => {
    const d = item && (item.updated || item.date);
    if (!d) return;
    const ms = typeof d.valueOf === 'function' ? d.valueOf() : new Date(d).getTime();
    if (Number.isFinite(ms) && ms > latest) latest = ms;
  });
  return latest ? new Date(latest).toISOString() : '';
}

hexo.extend.generator.register('sitemap', function (locals) {
  const seo = getSeoConfig(hexo.config);
  if (!seo.enable || !seo.sitemap.enable) return [];

  const posts = locals.posts.toArray()
    .filter(p => p.published !== false && p.sitemap !== false && (!seo.sitemap.exclude_noindex || p.noindex !== true))
    .sort((a, b) => (b.updated || b.date) - (a.updated || a.date));

  const pages = locals.pages.toArray()
    .filter(p => {
      const pathStr = String(p.path || '');
      if (pathStr === '404.html' || p.layout === '404') return false;
      if (isVerificationFile(pathStr)) return false;
      if (p.sitemap === false) return false;
      if (seo.sitemap.exclude_noindex && p.noindex === true) return false;
      return true;
    });

  const seen = new Set();
  const entries = [];

  function addEntry(loc, lastmod, changefreq, priority) {
    if (!loc || seen.has(loc)) return;
    seen.add(loc);
    entries.push({ loc, lastmod, changefreq, priority });
  }

  addEntry(seo.site_url + '/', latestDateIso(posts), 'daily', '1.0');

  posts.forEach(post => {
    addEntry(buildCanonicalUrl(seo, post), toIsoDate(post.updated || post.date), 'monthly', '0.7');
  });

  pages.forEach(page => {
    addEntry(buildCanonicalUrl(seo, page), toIsoDate(page.updated || page.date), 'monthly', '0.5');
  });

  if (seo.sitemap.include_categories) {
    locals.categories.toArray().forEach(cat => {
      const catPosts = cat.posts ? cat.posts.toArray().filter(p => p.published !== false && p.noindex !== true) : [];
      if (!catPosts.length) return;
      addEntry(toAbsoluteUrl(seo.site_url, '/' + cat.path), latestDateIso(catPosts), 'weekly', '0.5');
    });
  }

  if (seo.sitemap.include_tags && !seo.noindex.tags) {
    locals.tags.toArray().forEach(tag => {
      const tagPosts = tag.posts ? tag.posts.toArray().filter(p => p.published !== false && p.noindex !== true) : [];
      if (tagPosts.length < 2) return;
      addEntry(toAbsoluteUrl(seo.site_url, '/' + tag.path), latestDateIso(tagPosts), 'weekly', '0.3');
    });
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(e => {
      const parts = [
        '  <url>',
        `    <loc>${escapeXml(e.loc)}</loc>`
      ];
      if (e.lastmod) parts.push(`    <lastmod>${escapeXml(e.lastmod)}</lastmod>`);
      if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`);
      if (e.priority) parts.push(`    <priority>${e.priority}</priority>`);
      parts.push('  </url>');
      return parts.join('\n');
    }),
    '</urlset>',
    ''
  ].join('\n');

  return [{ path: 'sitemap.xml', data: xml }];
});

hexo.extend.generator.register('robots', function () {
  const seo = getSeoConfig(hexo.config);
  if (!seo.enable || !seo.robots.enable) return [];

  const lines = [
    '# Search & AI Search Crawlers (Allowed)',
    ...(seo.robots.allow_search_crawlers || []).flatMap(ua => [
      `User-agent: ${ua}`,
      'Allow: /',
      ''
    ]),
    `# AI Training / Data Crawlers (Policy: ${seo.robots.ai_training_policy})`,
    ...(seo.robots.ai_training_crawlers || []).flatMap(ua => [
      `User-agent: ${ua}`,
      seo.robots.ai_training_policy === 'disallow' ? 'Disallow: /' : 'Allow: /',
      ''
    ]),
    '# Default Crawler Policy',
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${seo.site_url}/sitemap.xml`,
    ''
  ];

  return [{ path: 'robots.txt', data: lines.join('\n') }];
});

hexo.extend.generator.register('llms', function (locals) {
  const seo = getSeoConfig(hexo.config);
  if (!seo.enable || !seo.llms_txt.enable) return [];

  const publicPosts = locals.posts.toArray()
    .filter(p => p.published !== false && p.noindex !== true)
    .sort((a, b) => (b.updated || b.date) - (a.updated || a.date));

  const categories = locals.categories.toArray()
    .filter(c => !c.parent && c.posts && c.posts.length > 0)
    .sort((a, b) => b.posts.length - a.posts.length);

  const appPosts = publicPosts.filter(p => p.categories && p.categories.some(c => c.name === '앱'));
  const docPosts = publicPosts.filter(p => !(p.categories && p.categories.some(c => c.name === '앱')))
    .slice(0, seo.llms_txt.max_posts || 30);

  const out = [
    `# ${seo.site_name}`,
    '',
    `> ${seo.default_description}`,
    '',
    `- URL: ${seo.site_url}/`,
    `- Sitemap: ${seo.site_url}/sitemap.xml`,
    '',
    '## 주요 카테고리',
    ...categories.map(c => `- [${c.name}](${toAbsoluteUrl(seo.site_url, '/' + c.path)}): ${c.posts.length}개 문서`),
    ''
  ];

  if (appPosts.length) {
    out.push('## 온라인 웹 도구');
    appPosts.forEach(p => {
      const desc = stripHtml(p.description || p.excerpt || p.content).slice(0, 120);
      out.push(`- [${p.title}](${buildCanonicalUrl(seo, p)}): ${desc}`);
    });
    out.push('');
  }

  out.push('## 주요 기술 문서');
  docPosts.forEach(p => {
    const desc = stripHtml(p.description || p.excerpt || p.content).slice(0, 140);
    out.push(`- [${p.title}](${buildCanonicalUrl(seo, p)}): ${desc}`);
  });
  out.push('');

  return [{ path: 'llms.txt', data: out.join('\n') }];
});
